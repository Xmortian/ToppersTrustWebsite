from rest_framework import viewsets
from .models import Tutor, Guardian, Job, Application
from .serializers import TutorSerializer, GuardianSerializer, JobSerializer, ApplicationSerializer
from .permissions import IsTutor, IsGuardian
from rest_framework.permissions import IsAuthenticated

class TutorViewSet(viewsets.ModelViewSet):
    queryset = Tutor.objects.all()
    serializer_class = TutorSerializer
    permission_classes = [IsAuthenticated]  # Anyone authenticated can view tutors

class GuardianViewSet(viewsets.ModelViewSet):
    queryset = Guardian.objects.all()
    serializer_class = GuardianSerializer
    permission_classes = [IsAuthenticated]  # Anyone authenticated can view guardians

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsGuardian()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(guardian=self.request.user.guardian)

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTutor()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(tutor=self.request.user.tutor)
