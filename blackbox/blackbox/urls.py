from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'blackbox.views.home'),
    (r'^home/$', 'blackbox.views.home'),
    (r'^login/$', 'blackbox.views.login_user'),
    (r'^logout/$', 'blackbox.views.logout_user'),
    (r'^register/$', 'blackbox.views.register_user'),
    (r'^wait-for-confirm-email/$', 'blackbox.views.wait_for_confirm_email'),
    (r'^confirm-email/$', 'blackbox.views.confirm_email'),
    (r'^manage/$', 'blackbox.views.manage'),
    (r'^manage/add-box$', 'blackbox.views.add_box'),
    (r'^manage/edit-box$', 'blackbox.views.edit_box'),
    (r'^manage/delete-box$', 'blackbox.views.delete_box'),
    (r'^explore/$', 'blackbox.views.explore'),
    (r'^help/$', 'blackbox.views.help'),
    (r'^box/$', 'blackbox.views.view_box'),
    (r'^search/$', 'blackbox.views.search'),
    (r'^callbox/(?P<taskUid>\w+)/$', 'blackbox.views.task'),
    (r'^getlikes/$', 'blackbox.views.get_likes'),
    (r'^likebox/$', 'blackbox.views.toggle_like'),
)
