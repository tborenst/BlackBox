from django.db import models

# User class for built-in authentication module
from django.contrib.auth.models import User

class BlackboxUser(models.Model):
	user = models.ForeignKey(User, related_name='+')
	token = models.CharField(max_length=5)

class Box(models.Model):
	owner = models.ForeignKey(BlackboxUser, related_name='+')
	name = models.CharField(max_length=80)
	description = models.TextField()
	documentation = models.FileField(upload_to='documents/%Y/%m/%d')
	script = models.FileField(upload_to='documents/%Y/%m/%d')
	uid = models.CharField(max_length=5)
	date = models.CharField(max_length=200)

class Like(models.Model):
	liked = models.ForeignKey(Box, related_name='+')
	liker = models.ForeignKey(BlackboxUser, related_name='+')