from django import forms

# class ImageUploadForm(forms.Form):
#     image = forms.ImageField()

class JsUploadForm(forms.Form):
	jsfile = forms.FileField()
