import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BookingPublicService } from '../../../Services/booking-public.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-booking-form-public',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-form-public.component.html',
  styleUrl: './booking-form-public.component.css'
})
export class BookingFormPublicComponent implements OnInit {
  publicClientId = '';
  publicToken = '';
  linkError = '';
  submitMessage = '';
  submitError = '';
  isSubmitting = false;
  isValidPublicLink = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private bookingPublicService: BookingPublicService
  ) {
    const queryParamMap = this.route.snapshot.queryParamMap;
    const paramMap = this.route.snapshot.paramMap;

    this.publicToken = paramMap.get('token') || queryParamMap.get('token') || '';
    this.publicClientId = queryParamMap.get('clientId') || '';
  }

  async ngOnInit(): Promise<void> {
    if (!this.publicToken) {
      this.linkError = 'Public link token is missing.';
      return;
    }

    try {
      const response = await this.bookingPublicService.validatePublicLink(this.publicToken);
      this.isValidPublicLink = !!response.valid;
      this.publicClientId = response.clientId || this.publicClientId;
      this.linkError = '';
    } catch {
      this.isValidPublicLink = false;
      this.linkError = 'Public link is invalid, expired, or already used.';
    }
  }

  form = this.fb.group({
    guests: this.fb.array([this.createGuest()]),

    internationalFlights: this.fb.group({
      flights: this.fb.array([this.createDepartureFlight()]), // ✅ array
      frequentFlyer: this.fb.group({
        airline: [''],
        statusLevel: [''],
        membershipNumber: ['']
      })
    }),

    travelInsurance: this.fb.group({
      companyName: [''],
      policyNumber: ['']
    }),

    emergencyContact: this.fb.group({
      name: [''],
      relationship: [''],
      homePhone: [''],
      cellPhone: ['']
    }),

    yourContact: this.fb.group({
      street: [''],
      city: [''],
      state: [''],
      zip: [''],
      email: [''],
      homePhone: [''],
      cellPhone: [''],

      // ✅ NEW: array en Your Contact Details
      contacts: this.fb.array([this.createYourContactPerson()])
    }),

    rooms: this.fb.array([this.createRoom()]),

    ownMadeReservations: this.fb.group({
      // ✅ CHANGED: Domestic Flights ahora es array
      domesticFlights: this.fb.array([this.createDepartureFlight()]),
      restaurants: this.fb.array([this.createRestaurant()])
    }),

    additionalInfo: ['']
  });

  get guests(): FormArray<FormGroup> {
    return this.form.get('guests') as FormArray<FormGroup>;
  }

  get rooms(): FormArray<FormGroup> {
    return this.form.get('rooms') as FormArray<FormGroup>;
  }

  get restaurants(): FormArray<FormGroup> {
    return this.form.get('ownMadeReservations.restaurants') as FormArray<FormGroup>;
  }

  get flights(): FormArray<FormGroup> {
    return this.form.get('internationalFlights.flights') as FormArray<FormGroup>;
  }

  // ✅ NEW getter: Domestic Flights array
  get domesticFlights(): FormArray<FormGroup> {
    return this.form.get('ownMadeReservations.domesticFlights') as FormArray<FormGroup>;
  }

  // ✅ NEW getter: Your Contact Details array
  get yourContactContacts(): FormArray<FormGroup> {
    return this.form.get('yourContact.contacts') as FormArray<FormGroup>;
  }

  isGuestInvalid(i: number, controlName: string): boolean {
    const group = this.guests.at(i);
    const c = group?.get(controlName);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  private createGuest(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      passportNumber: ['', Validators.required],

      passportFile: [null, Validators.required], // File
      passportKey: [''],
      passportFileName: [''],

      nationality: ['', Validators.required],
      birthDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      gender: [''],
      notes: [''],

      dietary: this.fb.group({
        dietary: [''],
        medical: [''],
        allergies: ['']
      }),

      physical: this.fb.group({
        height: [''],
        weight: [''],
        shoeSize: ['']
      })
    });
  }

  private createDepartureFlight(): FormGroup {
    return this.fb.group({
      flightNumber: [''],
      departureDate: [''],
      departureTime: [''],
      arrivalDate: [''],
      arrivalTime: [''],
      bookingCode: [''],
      departureAirport: [''],
      arrivalAirport: ['']
    });
  }

  // ✅ NEW: item del array para Your Contact Details
  private createYourContactPerson(): FormGroup {
    return this.fb.group({
      guest: [''],
      occupation: [''],
      phone: [''],
      email: ['']
    });
  }

  onGuestPassportSelected(event: Event, guestIndex: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!this.publicToken || !this.isValidPublicLink) {
      toast.error('Public link is not valid.');
      input.value = '';
      return;
    }

    const guest = this.guests.at(guestIndex);
    if (!guest) return;

    guest.patchValue({
      passportFile: file,
      passportFileName: file.name,
      passportKey: ''
    });
    guest.get('passportFile')?.markAsTouched();
    guest.get('passportFile')?.updateValueAndValidity();
    toast.success(`Passport file selected for Guest ${guestIndex + 1}`);
    input.value = '';
  }

  private createRoom(): FormGroup {
    return this.fb.group({
      guestNames: [''],
      roomType: [''],
      notes: ['']
    });
  }

  private createRestaurant(): FormGroup {
    return this.fb.group({
      name: [''],
      destination: [''],
      date: [''],
      time: ['']
    });
  }

  addGuest() {
    this.guests.push(this.createGuest());
  }
  removeGuest(i: number) {
    if (this.guests.length <= 1) return;
    this.guests.removeAt(i);
  }

  addRoom() {
    this.rooms.push(this.createRoom());
  }

  addflight() {
    this.flights.push(this.createDepartureFlight());
  }

  removeflight(i: number) {
    if (this.flights.length <= 1) return;
    this.flights.removeAt(i);
  }

  removeRoom(i: number) {
    if (this.rooms.length <= 1) return;
    this.rooms.removeAt(i);
  }

  addRestaurant() {
    this.restaurants.push(this.createRestaurant());
  }

  removeRestaurant(i: number) {
    if (this.restaurants.length <= 1) return;
    this.restaurants.removeAt(i);
  }

  // ✅ NEW: add/remove Domestic Flights
  addDomesticFlight() {
    this.domesticFlights.push(this.createDepartureFlight());
  }

  removeDomesticFlight(i: number) {
    if (this.domesticFlights.length <= 1) return;
    this.domesticFlights.removeAt(i);
  }

  // ✅ NEW: add/remove Your Contact Details array
  addYourContactPerson() {
    this.yourContactContacts.push(this.createYourContactPerson());
  }

  removeYourContactPerson(i: number) {
    if (this.yourContactContacts.length <= 1) return;
    this.yourContactContacts.removeAt(i);
  }

  async onSubmit() {
    this.form.markAllAsTouched();

    if (!this.publicToken || !this.isValidPublicLink) {
      this.submitError = 'This public link is not valid.';
      return;
    }

    if (this.form.invalid) {
      toast.error('Please fill in all required fields (including passport uploads).');
      return;
    }

    this.submitMessage = '';
    this.submitError = '';
    this.isSubmitting = true;

    try {
      const normalizedGuests = this.guests.controls.map((guestControl) => {
        const v: any = guestControl.value;

        return {
          firstName: v.firstName,
          lastName: v.lastName,
          passportNumber: v.passportNumber,
          passportFileName: v.passportFileName || null,
          nationality: v.nationality,
          birthDate: v.birthDate,
          expiryDate: v.expiryDate,
          gender: v.gender,
          notes: v.notes,

          dietary: {
            dietary: v.dietary?.dietary || '',
            medical: v.dietary?.medical || '',
            allergies: v.dietary?.allergies || ''
          },
          physical: {
            height: v.physical?.height || '',
            weight: v.physical?.weight || '',
            shoeSize: v.physical?.shoeSize || ''
          }
        };
      });

      const payload = {
        ...this.form.value,
        guests: normalizedGuests,
        tracking: {
          token: this.publicToken || null,
          clientId: this.publicClientId || null,
          source: 'public-link',
        },
      };

      const formData = new FormData();
      formData.append('payload', JSON.stringify(payload));

      this.guests.controls.forEach((guestControl, index) => {
        const file = guestControl.get('passportFile')?.value as File | null;
        if (file) {
          formData.append(`passportFile_${index}`, file, file.name);
        }
      });

      await this.bookingPublicService.submitPublicForm(this.publicToken, formData);

      this.submitMessage = 'Form submitted successfully.';
    } catch (e) {
      console.error(e);
      this.submitError = 'Could not submit the form. Please verify the link and try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm() {
    this.form.reset();

    this.guests.clear();
    this.guests.push(this.createGuest());

    this.rooms.clear();
    this.rooms.push(this.createRoom());

    this.restaurants.clear();
    this.restaurants.push(this.createRestaurant());

    // ✅ NEW: reset Domestic Flights array
    this.domesticFlights.clear();
    this.domesticFlights.push(this.createDepartureFlight());

    // ✅ NEW: reset Your Contact Details array
    this.yourContactContacts.clear();
    this.yourContactContacts.push(this.createYourContactPerson());

    // (No toqué flights reset porque no lo pediste)
  }
}
