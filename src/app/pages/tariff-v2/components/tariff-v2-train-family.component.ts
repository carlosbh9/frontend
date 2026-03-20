import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SeasonType } from '../../../interfaces/tariff-v2.interface';

@Component({
  selector: 'app-tariff-v2-train-family',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-4" [formGroup]="pricingGroup">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-semibold text-gray-900">{{ 'tariff.family.train_seasons' | translate }}</p>
          <button type="button" (click)="addSeason()" class="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">{{ 'tariff.family.add_season' | translate }}</button>
        </div>
        <div class="mb-4 flex flex-wrap gap-2 text-xs">
          <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.train_help_1' | translate }}</span>
          <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.train_help_2' | translate }}</span>
        </div>
        <div class="space-y-3" formArrayName="seasons">
          @for (group of seasonsArray.controls; track $index; let i = $index) {
            <div [formGroupName]="i" class="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-5">
              <select formControlName="season" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
                @for (season of seasonTypes; track season) {
                  <option [value]="season">{{ season }}</option>
                }
              </select>
              <input type="number" formControlName="adultPrice" placeholder="Adult price" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
              <input type="number" formControlName="childPrice" placeholder="Child price" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
              <input type="number" formControlName="guidePrice" placeholder="Guide price" class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-gray-300">
              <button type="button" (click)="removeSeason(i)" class="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200">Remove</button>
              <p class="text-xs text-gray-500 md:col-span-5">{{ 'tariff.family.train_row_help' | translate }}</p>
            </div>
          }
        </div>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-gray-50/70 p-4" [formGroup]="contentGroup">
        <p class="mb-4 text-sm font-semibold text-gray-900">{{ 'tariff.family.train_content' | translate }}</p>
        <div class="mb-4 flex flex-wrap gap-2 text-xs">
          <span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">{{ 'tariff.family.train_content_help' | translate }}</span>
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
export class TariffV2TrainFamilyComponent {
  @Input({ required: true }) pricingGroup!: FormGroup;
  @Input({ required: true }) contentGroup!: FormGroup;
  @Input() seasonTypes: SeasonType[] = [];
  @Input() addSeason: () => void = () => {};
  @Input() removeSeason: (index: number) => void = () => {};

  get seasonsArray() { return this.pricingGroup.get('seasons') as FormArray; }
}
