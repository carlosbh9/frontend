import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ChildPriceType, PricingMode, VehicleType } from '../../../interfaces/tariff-v2.interface';

@Component({
  selector: 'app-tariff-v2-activity-family',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-4" [formGroup]="pricingGroup">
        <p class="mb-4 text-sm font-semibold text-gray-900">{{ 'tariff.family.activity_pricing' | translate }}</p>
        <div class="mb-4 flex flex-wrap gap-2 text-xs">
          <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.activity_help_1' | translate }}</span>
          <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.activity_help_2' | translate }}</span>
          <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.activity_help_3' | translate }}</span>
        </div>
        <div class="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {{ 'tariff.family.required_for_mode' | translate }}
          @if (showGeneralPricingFields()) {
            <span class="font-semibold">{{ 'tariff.family.base_price' | translate }}</span>
          } @else if (pricingMode === 'PER_PAX_RANGE') {
            <span class="font-semibold">{{ 'tariff.family.at_least_one_range' | translate }}</span>
          } @else if (pricingMode === 'CUSTOM') {
            <span class="font-semibold">{{ 'tariff.family.valid_custom_json' | translate }}</span>
          }
        </div>
        @if (showGeneralPricingFields()) {
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div class="space-y-1">
              <input type="number" formControlName="soloTravelerPrice" [placeholder]="'tariff.family.solo_traveler_price' | translate" class="w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
              <p class="text-xs text-gray-500">{{ 'tariff.family.solo_traveler_help' | translate }}</p>
            </div>
            <div class="space-y-1">
              <input type="number" formControlName="guidePrice" [placeholder]="'tariff.family.guide_price' | translate" class="w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
              <p class="text-xs text-gray-500">{{ 'tariff.family.guide_price_help' | translate }}</p>
            </div>
            <div class="space-y-1">
              <label class="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                <input type="checkbox" [checked]="pricingGroup.get('pricePerson')?.value === true" (change)="pricingGroup.get('pricePerson')?.setValue($any($event.target).checked)">
                {{ 'tariff.family.price_per_person' | translate }}
              </label>
              <p class="text-xs text-gray-500">{{ 'tariff.family.price_per_person_help' | translate }}</p>
            </div>
          </div>
        }

        @if (pricingMode === 'PER_PAX_RANGE') {
          <div class="mt-4 space-y-3" formArrayName="ranges">
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
                <p class="text-xs text-gray-500 md:col-span-4 xl:col-span-5">{{ 'tariff.family.range_row_help' | translate }}</p>
              </div>
            }
          </div>
        }

        @if (pricingMode === 'CUSTOM') {
          <div class="mt-4">
            <textarea rows="5" formControlName="customText" placeholder='Custom pricing JSON, e.g. {"formula":"..."}' class="w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300"></textarea>
            <p class="mt-2 text-xs text-gray-500">{{ 'tariff.family.custom_json_help' | translate }}</p>
          </div>
        }
      </div>

      <div class="space-y-5">
        <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-4" [formGroup]="contentGroup">
          <p class="mb-4 text-sm font-semibold text-gray-900">{{ 'tariff.family.activity_content' | translate }}</p>
          <div class="mb-4 flex flex-wrap gap-2 text-xs">
            <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.activity_content_help_1' | translate }}</span>
            <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.activity_content_help_2' | translate }}</span>
          </div>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input type="text" formControlName="shortDescription" placeholder="Short description" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300 md:col-span-2">
            <input type="text" formControlName="duration" placeholder="Duration" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
            <input type="text" formControlName="schedules" placeholder="Schedules" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
            <input type="text" formControlName="contactPhone" placeholder="Contact phone" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
            <input type="text" formControlName="nearbyPlaces" placeholder="Nearby places" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
            <textarea rows="3" formControlName="description" placeholder="Description" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300 md:col-span-2"></textarea>
            <textarea rows="3" formControlName="remarks" placeholder="Remarks" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300"></textarea>
            <textarea rows="3" formControlName="observations" placeholder="Observations" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300"></textarea>
            <textarea rows="3" formControlName="cancellationPolicy" placeholder="Cancellation policy" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300 md:col-span-2"></textarea>
            <textarea rows="4" formControlName="generalInfoText" placeholder='General info JSON' class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300 md:col-span-2"></textarea>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-semibold text-gray-900">{{ 'tariff.family.child_policies' | translate }}</p>
            <button type="button" (click)="addChildPolicy()" class="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">{{ 'tariff.family.add_child_policy' | translate }}</button>
          </div>
          <div class="mb-4 flex flex-wrap gap-2 text-xs">
            <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.child_policy_help_1' | translate }}</span>
            <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.child_policy_help_2' | translate }}</span>
          </div>
          <div class="space-y-3">
            @for (group of childPoliciesArray.controls; track $index; let i = $index) {
              <div [formGroup]="$any(group)" class="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-5">
                <input type="number" formControlName="minAge" placeholder="Min age" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                <input type="number" formControlName="maxAge" placeholder="Max age" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                <select formControlName="priceType" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                  @for (priceType of childPriceTypes; track priceType) {
                    <option [value]="priceType">{{ priceType }}</option>
                  }
                </select>
                <input type="number" formControlName="value" placeholder="Value" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                <button type="button" (click)="removeChildPolicy(i)" class="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200">Remove</button>
                <p class="text-xs text-gray-500 md:col-span-5">{{ 'tariff.family.child_policy_row_help' | translate }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TariffV2ActivityFamilyComponent {
  @Input({ required: true }) pricingGroup!: FormGroup;
  @Input({ required: true }) contentGroup!: FormGroup;
  @Input({ required: true }) childPoliciesArray!: FormArray;
  @Input() pricingMode: PricingMode | '' = '';
  @Input() vehicleTypes: VehicleType[] = [];
  @Input() childPriceTypes: ChildPriceType[] = [];
  @Input() addRange: () => void = () => {};
  @Input() removeRange: (index: number) => void = () => {};
  @Input() addChildPolicy: () => void = () => {};
  @Input() removeChildPolicy: (index: number) => void = () => {};

  get rangesArray() {
    return this.pricingGroup.get('ranges') as FormArray;
  }

  showGeneralPricingFields() {
    return ['PER_PERSON', 'PER_GROUP'].includes(this.pricingMode);
  }
}
