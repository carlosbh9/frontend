import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SpecialDateOperation } from '../../../interfaces/tariff-v2.interface';

@Component({
  selector: 'app-tariff-v2-validity-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-4" [formGroup]="validityGroup">
      <p class="mb-4 text-sm font-semibold text-gray-900">{{ 'tariff.family.validity' | translate }}</p>
      <div class="mb-4 flex flex-wrap gap-2 text-xs">
        <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.validity_help_1' | translate }}</span>
        <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.validity_help_2' | translate }}</span>
        <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.validity_help_3' | translate }}</span>
      </div>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input type="text" formControlName="year" placeholder="Year" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
        <input type="date" formControlName="dateFrom" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
        <input type="date" formControlName="dateTo" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
      </div>
      <p class="mt-2 text-xs text-gray-500">{{ 'tariff.family.validity_window_help' | translate }}</p>

      <div class="mt-4 space-y-3" formArrayName="specialDates">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-gray-900">{{ 'tariff.family.special_dates' | translate }}</p>
          <button type="button" (click)="addSpecialDate()" class="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">{{ 'tariff.family.add_special_date' | translate }}</button>
        </div>
        @for (group of specialDatesArray.controls; track $index; let i = $index) {
          <div [formGroupName]="i" class="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-4 xl:grid-cols-5">
            <input type="date" formControlName="date" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
            <select formControlName="operation" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
              @for (operation of specialDateOperations; track operation) {
                <option [value]="operation">{{ operation }}</option>
              }
            </select>
            <input type="number" formControlName="value" placeholder="Value" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
            <input type="text" formControlName="note" placeholder="Note" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
            <button type="button" (click)="removeSpecialDate(i)" class="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200">Remove</button>
            <p class="text-xs text-gray-500 md:col-span-4 xl:col-span-5">{{ 'tariff.family.special_date_help' | translate }}</p>
          </div>
        }
      </div>

      <div class="mt-4 space-y-3" formArrayName="closingDates">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-gray-900">{{ 'tariff.family.closing_dates' | translate }}</p>
          <button type="button" (click)="addClosingDate()" class="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">{{ 'tariff.family.add_closing_date' | translate }}</button>
        </div>
        @for (group of closingDatesArray.controls; track $index; let i = $index) {
          <div [formGroupName]="i" class="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-3">
            <input type="date" formControlName="date" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
            <input type="text" formControlName="note" placeholder="Note" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
            <button type="button" (click)="removeClosingDate(i)" class="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200">Remove</button>
            <p class="text-xs text-gray-500 md:col-span-3">{{ 'tariff.family.closing_date_help' | translate }}</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class TariffV2ValiditySectionComponent {
  @Input({ required: true }) validityGroup!: FormGroup;
  @Input() specialDateOperations: SpecialDateOperation[] = [];
  @Input() addSpecialDate: () => void = () => {};
  @Input() removeSpecialDate: (index: number) => void = () => {};
  @Input() addClosingDate: () => void = () => {};
  @Input() removeClosingDate: (index: number) => void = () => {};

  get specialDatesArray() { return this.validityGroup.get('specialDates') as FormArray; }
  get closingDatesArray() { return this.validityGroup.get('closingDates') as FormArray; }
}
