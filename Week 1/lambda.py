people = [
	{"name": "Aboush", "house": "Dorchester"},
	{"name": "Leidy", "house": "West Chester"},
	{"name": "Essam", "house": "Michigan"}
]

def f(person):
	return person["name"]

people.sort(key=f)
print(people)

# Or

people.sort(key = lambda person: person["house"])
print(people)