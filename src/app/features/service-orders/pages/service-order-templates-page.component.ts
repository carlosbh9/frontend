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
    <div class="min-h-full bg-slate-50">
      <div class="mx-auto max-w space-y-6 p-4 sm:p-6">
        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="min-w-0">
              <div class="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                Workflow Configuration
              </div>
              <h1 class="mt-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Service Order Templates
              </h1>
              <p class="mt-1 max-w-2xl text-sm text-slate-600">
                Define SLA, ownership, priority, and default checklist rules for every type of operational order.
              </p>
            </div>

            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Templates loaded:
              <span class="font-semibold text-slate-900">{{ templates().length }}</span>
            </div>
          </div>
        </section>

        @if (error()) {
          <section class="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
            <p class="text-sm font-medium text-rose-700">{{ error() }}</p>
          </section>
        }

        <section class="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div class="space-y-6 xl:col-span-5">
            <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="border-b border-slate-100 p-5">
                <h2 class="text-sm font-semibold text-slate-900">Template Editor</h2>
                <p class="mt-1 text-sm text-slate-600">
                  Create a new template or update the selected configuration without leaving this page.
                </p>
              </div>

              <div class="space-y-5 p-5">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-slate-700">Order type</label>
                    <select
                      class="mt-2 block w-full rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      [(ngModel)]="form.type"
                    >
                      <option value="HOTEL">HOTEL</option>
                      <option value="TRANSPORT">TRANSPORT</option>
                      <option value="TOUR">TOUR</option>
                      <option value="TICKETS">TICKETS</option>
                      <option value="PREPAYMENT">PREPAYMENT</option>
                      <option value="INVOICE">INVOICE</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700">Owning area</label>
                    <select
                      class="mt-2 block w-full rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      [(ngModel)]="form.area"
                    >
                      <option value="RESERVAS">RESERVAS</option>
                      <option value="OPERACIONES">OPERACIONES</option>
                      <option value="CONTABILIDAD">CONTABILIDAD</option>
                      <option value="PAGOS">PAGOS</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700">Default priority</label>
                    <select
                      class="mt-2 block w-full rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      [(ngModel)]="form.defaultPriority"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700">SLA days</label>
                    <input
                      class="mt-2 block w-full rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      type="number"
                      min="0"
                      [(ngModel)]="form.slaDays"
                      placeholder="SLA days"
                    />
                  </div>
                </div>

                <label class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" [(ngModel)]="form.blocking" />
                  <span>
                    <span class="font-semibold text-slate-900">Blocking template</span>
                    <span class="block text-xs text-slate-500">Orders generated from this template should block dependent tasks.</span>
                  </span>
                </label>

                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h3 class="text-sm font-semibold text-slate-900">Checklist Template</h3>
                      <p class="mt-1 text-sm text-slate-600">Define the default steps that every generated order should inherit.</p>
                    </div>
                    <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                      {{ form.checklistTemplate.length }} items
                    </span>
                  </div>

                  <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]">
                    <input
                      class="rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      [(ngModel)]="newChecklistLabel"
                      placeholder="Checklist item label"
                    />
                    <input
                      class="rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      [(ngModel)]="newChecklistItemId"
                      placeholder="itemId"
                    />
                    <button
                      class="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-white"
                      type="button"
                      (click)="addChecklistItem()"
                    >
                      Add Item
                    </button>
                  </div>

                  <div class="mt-4 space-y-2">
                    @for (item of form.checklistTemplate; track item.itemId) {
                      <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div class="min-w-0">
                          <p class="text-sm font-semibold text-slate-900">{{ item.label }}</p>
                          <p class="text-xs text-slate-500">{{ item.itemId }}</p>
                        </div>
                        <button
                          class="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-50"
                          type="button"
                          (click)="removeChecklistItem(item.itemId)"
                        >
                          Remove
                        </button>
                      </div>
                    }

                    @if (!form.checklistTemplate.length) {
                      <div class="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                        No checklist items added yet.
                      </div>
                    }
                  </div>
                </div>

                <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    class="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                    type="button"
                    [disabled]="loading()"
                    (click)="form = { type: 'HOTEL', area: 'RESERVAS', defaultPriority: 'MEDIUM', slaDays: 2, blocking: true, checklistTemplate: [] }"
                  >
                    Reset
                  </button>
                  <button
                    class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    [disabled]="loading()"
                    (click)="saveTemplate()"
                  >
                    {{ form._id ? 'Update Template' : 'Save Template' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="xl:col-span-7">
            <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="border-b border-slate-100 p-5">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 class="text-sm font-semibold text-slate-900">Configured Templates</h2>
                    <p class="mt-1 text-sm text-slate-600">Review and edit the rules currently active for each order type.</p>
                  </div>
                  <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {{ templates().length }} templates
                  </div>
                </div>
              </div>

              <div class="overflow-x-auto p-5">
                <table class="min-w-full divide-y divide-slate-200 text-sm">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
                      <th class="px-4 py-3 text-left font-semibold text-slate-600">Area</th>
                      <th class="px-4 py-3 text-left font-semibold text-slate-600">Priority</th>
                      <th class="px-4 py-3 text-left font-semibold text-slate-600">SLA</th>
                      <th class="px-4 py-3 text-left font-semibold text-slate-600">Checklist</th>
                      <th class="px-4 py-3 text-left font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 bg-white">
                    @for (template of templates(); track template.type) {
                      <tr class="hover:bg-slate-50/80">
                        <td class="px-4 py-4">
                          <div class="font-medium text-slate-900">{{ template.type }}</div>
                          <div class="mt-1">
                            <span
                              class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                              [ngClass]="template.blocking ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-slate-100 text-slate-700 ring-slate-200'"
                            >
                              {{ template.blocking ? 'Blocking' : 'Non-blocking' }}
                            </span>
                          </div>
                        </td>
                        <td class="px-4 py-4 text-slate-600">{{ template.area }}</td>
                        <td class="px-4 py-4">
                          <span class="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                            {{ template.defaultPriority }}
                          </span>
                        </td>
                        <td class="px-4 py-4 text-slate-600">{{ template.slaDays }} days</td>
                        <td class="px-4 py-4">
                          <div class="space-y-1">
                            @for (item of template.checklistTemplate; track item.itemId) {
                              <div class="text-xs text-slate-600">
                                <span class="font-medium text-slate-700">{{ item.label }}</span>
                                <span class="text-slate-400"> · {{ item.itemId }}</span>
                              </div>
                            }
                            @if (!template.checklistTemplate.length) {
                              <span class="text-xs text-slate-400">No checklist</span>
                            }
                          </div>
                        </td>
                        <td class="px-4 py-4">
                          <div class="flex flex-wrap items-center gap-2">
                            <button
                              class="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50"
                              (click)="edit(template)"
                            >
                              Edit
                            </button>
                            <button
                              class="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-50"
                              (click)="remove(template)"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                    @if (!templates().length) {
                      <tr>
                        <td colspan="6" class="px-4 py-10 text-center text-sm text-slate-500">
                          No templates configured yet.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
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
