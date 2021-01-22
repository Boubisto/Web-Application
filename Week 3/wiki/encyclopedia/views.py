import markdown2
from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponseRedirect
from django import forms
import secrets

from . import util
from markdown2 import Markdown
import re

class NewPageForm(forms.Form):
    title = forms.CharField(label="Entry title", max_length=50)
    content = forms.CharField(widget=forms.Textarea(attrs={'class' : 'form-control col-md-5 col-lg-5', 'rows' : 5}))
    edit = forms.BooleanField(initial=False, widget=forms.HiddenInput(), required=False)


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def title(request,name):
    markdowner = Markdown()
    entryTitle = util.get_entry(name)
    if entryTitle is None:
        return render(request, "encyclopedia/404.html", {
            "entryTitle": name,
            "entries": util.list_entries()
        })
    else:
        return render(request, "encyclopedia/title.html",{
        "title": markdowner.convert(entryTitle),
        "entryTitle": name

    })

def search(request):
    keyword = request.POST["q"]
    results =[]
    entries = util.list_entries()
    if(util.get_entry(keyword) is not None):
        return HttpResponseRedirect(reverse("encyclopedia:title", kwargs={'name': keyword }))
    else:
        for entry in entries:
            if re.search(keyword, entry, re.IGNORECASE):
                results.append(entry)
        return render(request, "encyclopedia/search.html", {
            "entries": results,
            "results": results
        })

def newPage(request):
    if request.method == "POST":
        form = NewPageForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data["title"]
            content = form.cleaned_data["content"]
            if(util.get_entry(title) is None or form.cleaned_data["edit"] is True):
                util.save_entry(title,content)
                return HttpResponseRedirect(reverse("encyclopedia:title", kwargs={'name': title}))
            else:
                return render(request, "encyclopedia/existingPage.html.", {
                "form": form,
                "alreadyExist": True,
                "entry": title,
                "entries": util.list_entries()
                })
        else:
            return render(request, "encyclopedia/newPage.html", {
            "form": form,
            "alreadyExist": False
            })
    else:
        return render(request,"encyclopedia/newPage.html", {
            "form": NewPageForm(),
            "alreadyExist": False
        })  


def edit(request, entry):
    entryPage = util.get_entry(entry)
    if entryPage is None:
        return render(request, "encyclopedia/existingPage.html", {
            "entryTitle": entry
        })
    else:
        form = NewPageForm()
        form.fields["title"].initial = entry     
        form.fields["title"].widget = forms.HiddenInput()
        form.fields["content"].initial = entryPage
        form.fields["edit"].initial = True
        return render(request, "encyclopedia/newPage.html", {
            "form": form,
            "edit": form.fields["edit"].initial,
            "entryTitle": form.fields["title"].initial
        })

def random(request):
    entries = util.list_entries()
    randomPage = secrets.choice(entries)
    return HttpResponseRedirect(reverse("encyclopedia:title", kwargs={'name': randomPage}))

