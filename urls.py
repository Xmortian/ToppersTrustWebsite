from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TutorViewSet, GuardianViewSet, JobViewSet, ApplicationViewSet

router = DefaultRouter()
router.register(r'tutors', TutorViewSet)
router.register(r'guardians', GuardianViewSet)
router.register(r'jobs', JobViewSet)
router.register(r'applications', ApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
