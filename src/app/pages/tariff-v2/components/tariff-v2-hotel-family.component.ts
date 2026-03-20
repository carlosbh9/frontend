import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ChildPriceType, OccupancyType } from '../../../interfaces/tariff-v2.interface';

@Component({
  selector: 'app-tariff-v2-hotel-family',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-4" [formGroup]="pricingGroup">
        <p class="mb-4 text-sm font-semibold text-gray-900">{{ 'tariff.family.hotel_pricing' | translate }}</p>
        <div class="mb-4 flex flex-wrap gap-2 text-xs">
          <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.hotel_help_1' | translate }}</span>
          <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.hotel_help_2' | translate }}</span>
          <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.hotel_help_3' | translate }}</span>
        </div>
        <div class="space-y-3" formArrayName="rooms">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-gray-900">{{ 'tariff.family.room_rates' | translate }}</p>
            <button type="button" (click)="addRoom()" class="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">{{ 'tariff.family.add_room' | translate }}</button>
          </div>
          @for (room of roomsArray.controls; track $index; let roomIndex = $index) {
            <div [formGroupName]="roomIndex" class="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
              <div class="flex gap-3 items-center">
                <input type="text" formControlName="roomName" placeholder="Room name" class="flex-1 rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                <button type="button" (click)="addRoomOccupancy(roomIndex)" class="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Add occupancy</button>
                <button type="button" (click)="removeRoom(roomIndex)" class="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200">Remove room</button>
              </div>
              <div formArrayName="occupancyRates" class="space-y-3">
                @for (occupancy of getRoomOccupancyRates(roomIndex).controls; track $index; let occupancyIndex = $index) {
                  <div [formGroupName]="occupancyIndex" class="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 md:grid-cols-4">
                    <select formControlName="occupancy" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                      @for (occupancyType of occupancyTypes; track occupancyType) {
                        <option [value]="occupancyType">{{ occupancyType }}</option>
                      }
                    </select>
                    <input type="number" formControlName="confidential" placeholder="Confidential" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                    <input type="number" formControlName="rack" placeholder="Rack" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                    <button type="button" (click)="removeRoomOccupancy(roomIndex, occupancyIndex)" class="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200">Remove</button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <div class="space-y-5">
        <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-4" [formGroup]="contentGroup">
          <p class="mb-4 text-sm font-semibold text-gray-900">{{ 'tariff.family.hotel_content' | translate }}</p>
          <div class="mb-4 flex flex-wrap gap-2 text-xs">
            <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.hotel_content_help_1' | translate }}</span>
            <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.hotel_content_help_2' | translate }}</span>
          </div>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input type="text" formControlName="shortDescription" placeholder="Short description" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300 md:col-span-2">
            <input type="text" formControlName="duration" placeholder="Duration" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
            <input type="text" formControlName="contactPhone" placeholder="Contact phone" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
            <textarea rows="3" formControlName="description" placeholder="Description" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300 md:col-span-2"></textarea>
            <textarea rows="3" formControlName="remarks" placeholder="Remarks" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300"></textarea>
            <textarea rows="3" formControlName="cancellationPolicy" placeholder="Cancellation policy" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300"></textarea>
            <textarea rows="4" formControlName="generalInfoText" placeholder='General info JSON' class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300 md:col-span-2"></textarea>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-semibold text-gray-900">{{ 'tariff.family.child_policies' | translate }}</p>
            <button type="button" (click)="onAddChildPolicy()" class="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">{{ 'tariff.family.add_child_policy' | translate }}</button>
          </div>
          <div class="mb-4 flex flex-wrap gap-2 text-xs">
            <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.hotel_child_help' | translate }}</span>
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
                <button type="button" (click)="onRemoveChildPolicy(i)" class="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200">Remove</button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TariffV2HotelFamilyComponent {
  @Input({ required: true }) pricingGroup!: FormGroup;
  @Input({ required: true }) contentGroup!: FormGroup;
  @Input({ required: true }) childPoliciesArray!: FormArray;
  @Input() occupancyTypes: OccupancyType[] = [];
  @Input() childPriceTypes: ChildPriceType[] = [];
  @Input() addRoom: () => void = () => {};
  @Input() removeRoom: (index: number) => void = () => {};
  @Input() addRoomOccupancy: (roomIndex: number) => void = () => {};
  @Input() removeRoomOccupancy: (roomIndex: number, occupancyIndex: number) => void = () => {};
  @Input() addChildPolicy: () => void = () => {};
  @Input() removeChildPolicy: (index: number) => void = () => {};

  get roomsArray() {
    return this.pricingGroup.get('rooms') as FormArray;
  }

  getRoomOccupancyRates(index: number) {
    return this.roomsArray.at(index).get('occupancyRates') as FormArray;
  }

  onAddChildPolicy() {
    this.addChildPolicy();
  }

  onRemoveChildPolicy(index: number) {
    this.removeChildPolicy(index);
  }
}
