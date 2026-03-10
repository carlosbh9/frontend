import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceOrdersApi } from '../data-access/service-orders.api';
import { ServiceOrderTemplate } from '../data-access/service-orders.types';

@Component({
  selector: 'app-service-order-templates-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 p-4">
      <h1 class="text-lg font-semibold text-gray-900">Service Order Templates</h1>

      @if (error()) {
        <p class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ error() }}</p>
      }

      <div class="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <h2 class="text-sm font-semibold text-gray-900">Upsert Template</h2>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
          <select class="rounded-lg border border-gray-300 px-3 py-2 text-sm" [(ngModel)]="form.type">
            <option value="HOTEL">HOTEL</option>
            <option value="TRANSPORT">TRANSPORT</option>
            <option value="TOUR">TOUR</option>
            <option value="TICKETS">TICKETS</option>
            <option value="PREPAYMENT">PREPAYMENT</option>
            <option value="INVOICE">INVOICE</option>
          </select>
          <select class="rounded-lg border border-gray-300 px-3 py-2 text-sm" [(ngModel)]="form.area">
            <option value="RESERVAS">RESERVAS</option>
            <option value="OPERACIONES">OPERACIONES</option>
            <option value="CONTABILIDAD">CONTABILIDAD</option>
            <option value="PAGOS">PAGOS</option>
          </select>
          <select class="rounded-lg border border-gray-300 px-3 py-2 text-sm" [(ngModel)]="form.defaultPriority">
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
          <input class="rounded-lg border border-gray-300 px-3 py-2 text-sm" type="number" min="0" [(ngModel)]="form.slaDays" placeholder="SLA days" />
          <label class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <input type="checkbox" [(ngModel)]="form.blocking" />
            Blocking
          </label>
        </div>

        <div class="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]">
          <input
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            [(ngModel)]="newChecklistLabel"
            placeholder="Checklist item label"
          />
          <input
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            [(ngModel)]="newChecklistItemId"
            placeholder="itemId"
          />
          <button class="rounded-lg border border-gray-300 px-3 py-2 text-sm" type="button" (click)="addChecklistItem()">Add</button>
        </div>

        <div class="space-y-1">
          @for (item of form.checklistTemplate; track item.itemId) {
            <div class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <span>{{ item.itemId }} - {{ item.label }}</span>
              <button class="text-red-600" type="button" (click)="removeChecklistItem(item.itemId)">Remove</button>
            </div>
          }
        </div>

        <button
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          type="button"
          [disabled]="loading()"
          (click)="saveTemplate()"
        >
          Save template
        </button>
      </div>

      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left">Type</th>
              <th class="px-3 py-2 text-left">Area</th>
              <th class="px-3 py-2 text-left">Priority</th>
              <th class="px-3 py-2 text-left">SLA</th>
              <th class="px-3 py-2 text-left">Blocking</th>
              <th class="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (template of templates(); track template.type) {
              <tr>
                <td class="px-3 py-2">{{ template.type }}</td>
                <td class="px-3 py-2">{{ template.area }}</td>
                <td class="px-3 py-2">{{ template.defaultPriority }}</td>
                <td class="px-3 py-2">{{ template.slaDays }}</td>
                <td class="px-3 py-2">{{ template.blocking ? 'Yes' : 'No' }}</td>
                <td class="px-3 py-2">
                  <button class="rounded border border-gray-300 px-2 py-1 text-xs" (click)="edit(template)">Edit</button>
                  <button class="ml-2 rounded border border-red-300 px-2 py-1 text-xs text-red-700" (click)="remove(template)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ServiceOrderTemplatesPageComponent implements OnInit {
  private readonly api = inject(ServiceOrdersApi);

  readonly templates = signal<ServiceOrderTemplate[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  newChecklistLabel = '';
  newChecklistItemId = '';
  form: ServiceOrderTemplate = {
    type: 'HOTEL',
    area: 'RESERVAS',
    defaultPriority: 'MEDIUM',
    slaDays: 2,
    blocking: true,
    checklistTemplate: []
  };

  async ngOnInit(): Promise<void> {
    await this.loadTemplates();
  }

  async loadTemplates(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const templates = await this.api.listTemplates();
      this.templates.set(templates || []);
    } catch (error: any) {
      this.error.set(error?.error?.message || 'Could not load templates');
      this.templates.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  addChecklistItem(): void {
    const label = this.newChecklistLabel.trim();
    const itemId = this.newChecklistItemId.trim() || label.toLowerCase().replace(/\s+/g, '-');
    if (!label || !itemId) return;
    if (this.form.checklistTemplate.some((item) => item.itemId === itemId)) return;

    this.form = {
      ...this.form,
      checklistTemplate: [...this.form.checklistTemplate, { itemId, label }]
    };
    this.newChecklistLabel = '';
    this.newChecklistItemId = '';
  }

  removeChecklistItem(itemId: string): void {
    this.form = {
      ...this.form,
      checklistTemplate: this.form.checklistTemplate.filter((item) => item.itemId !== itemId)
    };
  }

  edit(template: ServiceOrderTemplate): void {
    this.form = {
      _id: template._id,
      type: template.type,
      area: template.area,
      defaultPriority: template.defaultPriority,
      slaDays: template.slaDays,
      blocking: template.blocking,
      checklistTemplate: [...(template.checklistTemplate || [])]
    };
  }

  async saveTemplate(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.api.upsertTemplate(this.form);
      await this.loadTemplates();
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not save template');
    } finally {
      this.loading.set(false);
    }
  }

  async remove(template: ServiceOrderTemplate): Promise<void> {
    if (!template._id) return;
    if (!window.confirm(`Delete template ${template.type}?`)) return;
    this.loading.set(true);
    this.error.set('');
    try {
      await this.api.deleteTemplate(template._id);
      await this.loadTemplates();
    } catch (error: any) {
      this.error.set(error?.error?.message || 'Could not delete template');
    } finally {
      this.loading.set(false);
    }
  }
}
