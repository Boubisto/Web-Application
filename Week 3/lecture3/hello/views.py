from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.

def index(request):
    return render(request, "hello/index.html")

def greet(request, name):
    return render(request, "hello/greetings.html", {
        "name": name.capitalize()
    })

def aboush(request):
    return HttpResponse("Hello, Bouba")

def bouba(request):
    return HttpResponse("Hello, Boubisto")

#def greet(request, name):
  #  return HttpResponse(f"Hello, {name.capitalize()}")
