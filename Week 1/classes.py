class Point():
    # A method defining how to create a point:
    def __init__(self, input1, input2):
        self.x = input1
        self.y = input2

p = Point(2, 8)
print(p.x)
print(p.y)

class Flight():
	# A method defining how to create a flight
	def __init__(self, capacity):
		self.capacity = capacity
		self.passengers = []

	def add_passenger(self, name):
		if not self.open_seats():
			return False
		self.passengers.append(name)
		return True

	def open_seats(self):
		return self.capacity - len(self.passengers)

flight = Flight(3)

people = ["aboush", "leidy", "Bouba", "essam"]

for person in people:
	success = flight.add_passenger(person)
	if success:
		print(f"We added {person} to the flight succesfully")
	else:
		print(f"There are no available seats for {person}")
