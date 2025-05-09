from rest_framework import serializers
from .models import Tutor, Job, Guardian, Admin, Interacts, ShortList, Posts, PostDeleteJobs, RecommendedTutor, Thana

#Serializer for Tutor Model
class TutorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tutor
        fields = 'all'


#Serializer for Job Model
class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = 'all'


#Serializer for Guardian Model
class GuardianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guardian
        fields = 'all'


#Serializer for Admin Model
class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = 'all'


#Serializer for Interacts Model
class InteractsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interacts
        fields = 'all'


#Serializer for ShortList Model
class ShortListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShortList
        fields = 'all'


#Serializer for Posts Model
class PostsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Posts
        fields = 'all'


#Serializer for PostDeleteJobs Model
class PostDeleteJobsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostDeleteJobs
        fields = 'all'


#Serializer for RecommendedTutor Model
class RecommendedTutorSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecommendedTutor
        fields = 'all'


#Serializer for Thana Model
class ThanaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thana
        fields = 'all'

