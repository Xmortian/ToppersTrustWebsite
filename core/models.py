import uuid
from django.db import models

class Admin(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)

    def __str__(self):
        return self.name


class Tutor(models.Model):
    name = models.CharField(max_length=100)
    gender = models.CharField(max_length=10)
    photo = models.TextField()
    exp = models.IntegerField()
    edu_qualification = models.TextField()
    rating = models.DecimalField(max_digits=3, decimal_places=2)
    ssc_school = models.TextField()
    ssc_grade = models.CharField(max_length=10)
    hsc_school = models.TextField()
    hsc_grade = models.CharField(max_length=10)
    uni = models.TextField()
    uni_grade = models.CharField(max_length=10)
    address = models.TextField()
    city = models.CharField(max_length=50)
    full_address = models.TextField()
    areas_to_tutor = models.TextField()
    fb_link = models.TextField()
    nid_bcid = models.TextField()
    drive_link = models.TextField()
    verified_yn = models.BooleanField()
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    medium = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Guardian(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    city = models.CharField(max_length=50)
    full_address = models.TextField()
    area = models.CharField(max_length=50)
    nid_bcid = models.TextField()
    drive_link = models.TextField()
    verified_yn = models.BooleanField()
    email = models.EmailField()
    phone = models.CharField(max_length=20)

    def __str__(self):
        return self.name


class Job(models.Model):
    location = models.TextField()
    time = models.CharField(max_length=100)  # updated
    days_per_week = models.IntegerField()
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    subjects = models.TextField()
    medium = models.CharField(max_length=100)  # updated
    class_level = models.CharField(max_length=100)  # updated from 'class'
    student_gender = models.CharField(max_length=100)  # updated
    gender_preference = models.CharField(max_length=100, default='No Preference')  # updated
    monthly_class_wise_pay = models.BooleanField(default=False)
    number_of_students = models.IntegerField(default=1)
    date_posted = models.DateField(auto_now_add=True)
    guardian = models.ForeignKey(Guardian, on_delete=models.CASCADE)

    def __str__(self):
        return f"Job ID {self.id} - {self.class_level}"


class Interacts(models.Model):
    tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    apply_yn = models.BooleanField()

    class Meta:
        unique_together = (('tutor', 'job'),)


class ShortList(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    tutor = models.ForeignKey(Tutor, on_delete=models.CASCADE)

    class Meta:
        unique_together = (('job', 'tutor'),)


class Posts(models.Model):
    guardian = models.ForeignKey(Guardian, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)

    class Meta:
        unique_together = (('guardian', 'job'),)


class PostDeleteJobs(models.Model):
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)

    class Meta:
        unique_together = (('admin', 'job'),)



class Thana(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name



class RecommendedTutor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tutor_name = models.TextField()
    photo_url = models.TextField()
    description = models.TextField(blank=True, null=True)
    display_order = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.tutor_name


