import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PricingMode, VehicleType } from '../../../interfaces/tariff-v2.interface';

@Component({
  selector: 'app-tariff-v2-transport-family',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-4" [formGroup]="pricingGroup">
        <p class="mb-4 text-sm font-semibold text-gray-900">{{ 'tariff.family.transport_pricing' | translate }}</p>
        <div class="mb-4 flex flex-wrap gap-2 text-xs">
          <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.transport_help_1' | translate }}</span>
          <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.transport_help_2' | translate }}</span>
          <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.transport_help_3' | translate }}</span>
        </div>
        @if (pricingMode === 'PER_PAX_RANGE') {
          <div class="space-y-3" formArrayName="ranges">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-gray-900">{{ 'tariff.family.pax_ranges' | translate }}</p>
              <button type="button" (click)="addRange()" class="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">{{ 'tariff.family.add_range' | translate }}</button>
            </div>
            @for (group of rangesArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-4 xl:grid-cols-5">
                <input type="number" formControlName="minPax" placeholder="Min pax" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                <input type="number" formControlName="maxPax" placeholder="Max pax" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                <input type="number" formControlName="price" placeholder="Price" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                <select formControlName="vehicleType" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                  <option value="">Vehicle type</option>
                  @for (vehicleType of vehicleTypes; track vehicleType) {
                    <option [value]="vehicleType">{{ vehicleType }}</option>
                  }
                </select>
                <button type="button" (click)="removeRange(i)" class="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200">Remove</button>
                <p class="text-xs text-gray-500 md:col-span-4 xl:col-span-5">{{ 'tariff.family.transport_range_help' | translate }}</p>
              </div>
            }
          </div>
        }

        @if (pricingMode === 'CUSTOM') {
          <textarea rows="5" formControlName="customText" placeholder='Custom pricing JSON, e.g. {"formula":"..."}' class="w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300"></textarea>
          <p class="mt-2 text-xs text-gray-500">{{ 'tariff.family.custom_transport_help' | translate }}</p>
        }

        <div class="mt-4 space-y-3" formArrayName="vehicleRates">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-gray-900">{{ 'tariff.family.vehicle_rates' | translate }}</p>
            <button type="button" (click)="addVehicleRate()" class="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">{{ 'tariff.family.add_vehicle_rate' | translate }}</button>
          </div>
          @for (group of vehicleRatesArray.controls; track $index; let i = $index) {
            <div [formGroupName]="i" class="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-3">
              <select formControlName="vehicleType" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                @for (vehicleType of vehicleTypes; track vehicleType) {
                  <option [value]="vehicleType">{{ vehicleType }}</option>
                }
              </select>
              <input type="number" formControlName="price" placeholder="Price" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
              <button type="button" (click)="removeVehicleRate(i)" class="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200">Remove</button>
              <p class="text-xs text-gray-500 md:col-span-3">{{ 'tariff.family.vehicle_rate_help' | translate }}</p>
            </div>
          }
        </div>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-4" [formGroup]="contentGroup">
        <p class="mb-4 text-sm font-semibold text-gray-900">{{ 'tariff.family.transport_content' | translate }}</p>
        <div class="mb-4 flex flex-wrap gap-2 text-xs">
          <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.transport_content_help' | translate }}</span>
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input type="text" formControlName="shortDescription" placeholder="Short description" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300 md:col-span-2">
          <input type="text" formControlName="duration" placeholder="Duration" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
          <input type="text" formControlName="schedules" placeholder="Schedules" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
          <textarea rows="3" formControlName="description" placeholder="Description" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300 md:col-span-2"></textarea>
          <textarea rows="3" formControlName="remarks" placeholder="Remarks" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300"></textarea>
          <textarea rows="3" formControlName="observations" placeholder="Observations" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300"></textarea>
          <textarea rows="4" formControlName="generalInfoText" placeholder='General info JSON' class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300 md:col-span-2"></textarea>
        </div>
      </div>
    </div>
  `,
})
export class TariffV2TransportFamilyComponent {
  @Input({ required: true }) pricingGroup!: FormGroup;
  @Input({ required: true }) contentGroup!: FormGroup;
  @Input() pricingMode: PricingMode | '' = '';
  @Input() vehicleTypes: VehicleType[] = [];
  @Input() addRange: () => void = () => {};
  @Input() removeRange: (index: number) => void = () => {};
  @Input() addVehicleRate: () => void = () => {};
  @Input() removeVehicleRate: (index: number) => void = () => {};

  get rangesArray() { return this.pricingGroup.get('ranges') as FormArray; }
  get vehicleRatesArray() { return this.pricingGroup.get('vehicleRates') as FormArray; }
}
