from django.shortcuts import render, redirect, render_to_response, HttpResponseRedirect
from django.template import RequestContext
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
# Decorator to use built-in authentication system
from django.contrib.auth.decorators import login_required

# Used to create and manually log in a user
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate

# Used for email authentication
from django.core.mail import send_mail
import random
import time

from blackbox.models import *
from blackbox.forms import *

# HTTP requests
import requests
import json
from django.http import HttpResponse

#============#
# API ROUTES #
#============#

def task(request, taskUid):
	boxes = Box.objects.filter(uid=taskUid)
	if len(boxes) <= 0:
		return HttpResponse("{error: 'box not found.'}", content_type="application/json")
	box = boxes[0]
	rawParams = request.GET.lists()
	params = {}
	for i in range(len(rawParams)):
		pair = rawParams[i]
		key = pair[0]
		val = pair[1]
		params[key] = val
	params["_box_script"] = box.script.read()
	taskResponse = requests.get("http://localhost:8888/task", params=params)
	return HttpResponse(taskResponse.content, content_type="application/json")

#=============#
# VIEW ROUTES #
#=============#

def home(request):
	context = {}
	context["loggedin"] = request.user.is_authenticated()
	boxes = Box.objects.order_by('-date')[:10]
	context["boxes"] = boxes
	return render(request, 'blackbox/home.html', context)

def explore(request):
	return home(request)

def help(request):
	context = {}
	context["loggedin"] = request.user.is_authenticated()
	return render(request, 'blackbox/help.html', context)

def view_box(request):
	context = {}
	context["loggedin"] = request.user.is_authenticated()
	uid = request.GET.get("uid")
	boxes = Box.objects.filter(uid=uid)
	if(len(boxes) > 0):
		box = boxes[0]
		context["box"] = box
		context["script"] = box.script.read()
		context["documentation"] = box.documentation.read()
		context["already_liked"] = False
		if(request.user.is_authenticated()):
			bbUsers = BlackboxUser.objects.filter(user=request.user)
			if(len(bbUsers) > 0):
				bbUser = bbUsers[0]
				context["already_liked"] = (len(Like.objects.all().filter(liker=bbUser, liked=box)) > 0)
			if box.owner.user == request.user:
				context["own_box"] = True
			else:
				context["own_box"] = False
		return render(request, 'blackbox/viewbox.html', context)
	else:
		context["box"] = None
		return render(request, 'blackbox/viewbox.html', context)

def search(request):
	context = {}
	context["loggedin"] = request.user.is_authenticated()
	context["terms"] = request.GET.get("search")
	words = request.GET.get("search").split(" ")
	boxes = Box.objects.filter(reduce(lambda x, y: x | y, [Q(name__contains=word) for word in words]))
	context["boxes"] = boxes
	return render(request, 'blackbox/search.html', context)

#============#
# MANAGEMENT #
#============#

def toggle_like(request):
	res = {}
	user = request.user 
	bbUser = BlackboxUser.objects.filter(user=user)[0]
	boxes = Box.objects.filter(uid=request.GET.get("uid"))
	if not request.user.is_authenticated():
		res["status"] = "false"
		return HttpResponse(res["status"], content_type="application/json")
	if(len(boxes) > 0):
		box = boxes[0]
		likes = Like.objects.all().filter(liked=box, liker=bbUser)
		if(len(likes) > 0):
			# toggle off
			like = likes[0]
			like.delete()
			res["status"] = "true"
			return HttpResponse(res["status"], content_type="application/json")
		else:
			# toggle on
			like = Like(liked=box, liker=bbUser)
			like.save()
			res["status"] = "true"
			return HttpResponse(res["status"], content_type="application/json")
	else:
		# no box found
		res["status"] = "false"
		return HttpResponse(res["status"], content_type="application/json")

def get_likes(request):
	res = {}
	res["likes"] = "box not found"
	uid = request.GET.get("uid")
	boxes = Box.objects.filter(uid=uid)
	if(len(boxes) > 0):
		box = boxes[0]
		likes = Like.objects.all().filter(liked=box)
		res["likes"] = len(likes)
	return HttpResponse(res["likes"], content_type="application/json")

@login_required(login_url='/login/')
def manage(request):
	context = {}
	context["loggedin"] = request.user.is_authenticated()
	context["username"] = request.user.username
	# get user's boxes
	bbUser = BlackboxUser.objects.filter(user=request.user)[0]
	boxes = Box.objects.order_by('-date').filter(owner=bbUser)
	context["boxes"] = boxes
	return render(request, 'blackbox/manage.html', context)

@login_required(login_url='/login/')
def delete_box(request):
	context = {}
	context["loggedin"] = request.user.is_authenticated()
	context["username"] = request.user.username
	uid = request.GET.get("uid")
	boxes = Box.objects.filter(uid=uid)
	if(len(boxes) > 0):
		box = boxes[0]
		if(box.owner.user == request.user):
			box.delete()
		return manage(request)
	else:
		context["box"] = None
		return render(request, 'blackbox/addbox.html', context)

@login_required(login_url='/login/')
def edit_box(request):
	if(request.method == 'GET'):
		context = {}
		context["loggedin"] = request.user.is_authenticated()
		context["username"] = request.user.username
		context["edit"] = True
		uid = request.GET.get("uid")
		boxes = Box.objects.filter(uid=uid)
		if(len(boxes) > 0):
			box = boxes[0]
			context["box"] = box
			context["errors"] = ["For security reasons you must re-upload the .js and .md files."]
		else:
			context["box"] = None
		return render(request, 'blackbox/addbox.html', context)


@login_required(login_url='/login/')
def add_box(request):
	errors = []
	context = {}
	context["loggedin"] = request.user.is_authenticated()
	context["username"] = request.user.username
	context["edit"] = False

	if(request.method == 'POST'):
		# handle request to create a new box
		# check for missing fields
		if not 'boxname' in request.POST or request.POST['boxname'] == "":
			errors.append('You must name your Box.')
		else:
			if not 'edit' in request.POST:
				context["boxname"] = request.POST['boxname']
				if len(Box.objects.filter(name=request.POST['boxname'])) > 0:
					errors.append('The Box name you have chosen is already taken. Please choose another name.')
		if not 'description' in request.POST or request.POST['description'] == "":
			errors.append('You must provide a description for your Box.')
		else:
			context["description"] = request.POST['description']
		if not 'script_file' in request.FILES:
			errors.append('You must provide a script file for your Box.')
		else:
			# check file extension
			scriptExt = (request.FILES['script_file'].name).lower().split(".")[-1]
			if scriptExt != "js":
				errors.append('Script must be a Javascript file.')
		if not 'doc_file' in request.FILES:
			errors.append('You must provide a documentation file for your Box.')
		else:
			# check file extension
			docExt = (request.FILES['doc_file'].name).lower().split(".")[-1]
			if docExt != "md":
				errors.append('Documentation must be a Markdown file.')

		context["errors"] = errors
		if len(errors) > 0:
			if 'edit' in request.POST:
				context["edit"] = True
				context["box"] = Box.objects.filter(uid=request.POST['uid'])[0]
			return render(request, 'blackbox/addbox.html', context)

		if 'edit' in request.POST:
			old_box = Box.objects.filter(uid=request.POST['uid'])[0]
			old_box.owner = BlackboxUser.objects.filter(user=request.user)[0]
			old_box.name = request.POST['boxname']
			old_box.description = request.POST['description']
			old_box.script = request.FILES['script_file']
			old_box.documentation = request.FILES['doc_file']
			old_box.save()

			uid = old_box.uid
			context["box"] = old_box
			context["script"] = old_box.script.read()
			context["documentation"] = old_box.documentation.read()
			context["own_box"] = True
			return render(request, 'blackbox/viewbox.html', context)
		else:
			# create and save box
			owner = BlackboxUser.objects.filter(user=request.user)[0]
			name = request.POST['boxname']
			description = request.POST['description']
			script = request.FILES['script_file']
			documentation = request.FILES['doc_file']
			uid = makeToken()
			new_box = Box(owner=owner, name=name, description=description, script=script, documentation=documentation, uid=uid, date=time.strftime("%c"))
			new_box.save()
			context["boxid"] = uid
			return render(request, 'blackbox/addboxsuccess.html', context)
	else:
		return render(request, 'blackbox/addbox.html', context)



#=======================#
# AUTHENTICATION ROUTES #
#=======================#

def login_user(request):
	logout(request)
	username = password = ''
	errors = []
	if request.method == 'POST':
		username = request.POST['username']
		password = request.POST['password']
		user = authenticate(username=username, password=password)
		if user is not None:
			if user.is_active:
				login(request, user)
				return HttpResponseRedirect('/home/')
			else:
				errors.append('You must confirm your email address before logging-in.')
				return render(request, 'blackbox/login.html', {'errors': errors})
		else:
			errors.append('The username or password you entered is incorrect.')
			return render(request, 'blackbox/login.html', {'errors': errors})
	return render(request, 'blackbox/login.html', {'errors': errors})

def logout_user(request):
	logout(request)
	return redirect('/home')

def register_user(request):
	errors = []
	if request.method == 'GET':
		return render(request, 'blackbox/register.html', {'errors': errors})
	if request.method == 'POST':
		username = request.POST['username']
		password = request.POST['password']
		email = request.POST['email']
		# check for errors
		if(username == '' or password == '' or email == ''):
			errors.append('Please fill-in all required fields.')
		if len(User.objects.filter(username = username)) > 0:
			errors.append('Username is already taken, please choose another username.')
		if len(User.objects.filter(email = email)) > 0:
			errors.append('Email address is already taken, please use another email address.')
		if errors:
			return render(request, 'blackbox/register.html', {'errors': errors})
		# create (inactive) user
		newUser = User.objects.create_user(username=username, password=password, email=email)
		newUser.is_active = False
		newUser.save()
		token = makeToken()
		newBlackboxUser = BlackboxUser(user=newUser, token=token)
		newBlackboxUser.save()
		# send confirmation/activation email to user
		send_mail('Welcome to Blackbox', makeEmailText(token), 'blackbox.cmu@gmail.com', [email], fail_silently=False)
    	return redirect('/wait-for-confirm-email')
	return render(request, 'blackbox/register.html', {'errors': errors})

def wait_for_confirm_email(request):
	return render(request, 'blackbox/waitforconfirm.html', {})

def confirm_email(request):
	token = request.GET.get('token')
	bbUser = BlackboxUser.objects.filter(token=token)[0]
	user = bbUser.user
	user.is_active = True
	user.save()
	return render(request, 'blackbox/emailconfirmed.html')

#================#
# HELPER METHODS #
#================#

def makeToken():
    length = 5;
    token = "";
    alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for i in xrange(length):
        randomIndex = random.randrange(0, len(alphabet))
        token += alphabet[randomIndex]
    return token;

def makeEmailText(token):
    text = "Dear Blackbox user, please click the following link in order to confirm your email address: \n"
    text += "http://128.237.239.15:8000/confirm-email?token=" + token
    return text
