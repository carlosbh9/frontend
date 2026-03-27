import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceOrdersApi } from '../data-access/service-orders.api';
import { ServiceOrderTemplate, ServiceOrderTemplateChecklistItem, ServiceOrderTemplateStage } from '../data-access/service-orders.types';

@Component({
  selector: 'app-service-order-templates-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-full bg-slate-50">
      <div class="mx-auto max-w space-y-3 p-1 sm:p-2">
        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="min-w-0">
              <div class="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                Workflow Configuration
              </div>
              <h1 class="mt-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Service Order Workflow Templates
              </h1>
              <p class="mt-1 max-w-3xl text-sm text-slate-600">
                Define visual stages and checklist items per stage. Orders created from a sold quote will inherit a workflow snapshot from these templates.
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
          <div class="space-y-6 xl:col-span-6">
            <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="border-b border-slate-100 p-5">
                <h2 class="text-sm font-semibold text-slate-900">Template Editor</h2>
                <p class="mt-1 text-sm text-slate-600">
                  Create one or more templates per order type and decide which stages the operations team should follow.
                </p>
              </div>

              <div class="space-y-5 p-5">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-slate-700">Template name</label>
                    <input class="mt-2 block w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="form.name" placeholder="Hotel Reservation Standard" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700">Code</label>
                    <input class="mt-2 block w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="form.code" placeholder="hotel-reservation-standard" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700">Order type</label>
                    <select class="mt-2 block w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="form.type">
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
                    <select class="mt-2 block w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="form.area">
                      <option value="RESERVAS">RESERVAS</option>
                      <option value="OPERACIONES">OPERACIONES</option>
                      <option value="CONTABILIDAD">CONTABILIDAD</option>
                      <option value="PAGOS">PAGOS</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700">Default priority</label>
                    <select class="mt-2 block w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="form.defaultPriority">
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700">SLA days</label>
                    <input class="mt-2 block w-full rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" type="number" min="0" [(ngModel)]="form.slaDays" />
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <label class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" [(ngModel)]="form.active" />
                    <span><span class="font-semibold text-slate-900">Active</span><span class="block text-xs text-slate-500">Available for new orders.</span></span>
                  </label>
                  <label class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" [(ngModel)]="form.isDefault" />
                    <span><span class="font-semibold text-slate-900">Default</span><span class="block text-xs text-slate-500">Preferred template for this type.</span></span>
                  </label>
                  <label class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" [(ngModel)]="form.blocking" />
                    <span><span class="font-semibold text-slate-900">Blocking</span><span class="block text-xs text-slate-500">Order blocks dependent tasks.</span></span>
                  </label>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h3 class="text-sm font-semibold text-slate-900">Stages</h3>
                      <p class="mt-1 text-sm text-slate-600">Build the visible operational flow stage by stage.</p>
                    </div>
                    <button class="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-white" type="button" (click)="addStage()">
                      Add Stage
                    </button>
                  </div>

                  <div class="mt-4 space-y-4">
                    @for (stage of form.stages; track stage.code; let stageIndex = $index) {
                      <div class="rounded-2xl border border-slate-200 bg-white p-4">
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="stage.label" placeholder="Stage label" />
                          <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="stage.code" placeholder="STAGE_CODE" />
                          <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" type="number" min="1" [(ngModel)]="stage.order" placeholder="Order" />
                          <select class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="stage.color">
                            @for (color of stageColors; track color) {
                              <option [value]="color">{{ color }}</option>
                            }
                          </select>
                          <input class="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 md:col-span-2 xl:col-span-4" [(ngModel)]="stage.description" placeholder="What should the user understand in this stage?" />
                        </div>

                        <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                          <label class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                            <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" [(ngModel)]="stage.isFinal" />
                            <span>Final stage</span>
                          </label>
                          <label class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                            <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" [(ngModel)]="stage.requireCommentOnEnter" />
                            <span>Comment required on enter</span>
                          </label>
                          <label class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                            <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" [(ngModel)]="stage.requireCommentOnComplete" />
                            <span>Comment required on complete</span>
                          </label>
                        </div>

                        <div class="mt-4 flex flex-wrap items-center gap-2">
                          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Required attachments</span>
                          @for (attachmentType of attachmentTypes; track attachmentType) {
                            <label class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
                              <input type="checkbox" class="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" [checked]="stage.requiredAttachments?.includes(attachmentType)" (change)="toggleStageAttachment(stageIndex, attachmentType, $event)" />
                              <span>{{ attachmentType }}</span>
                            </label>
                          }
                        </div>

                        <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div class="flex items-center justify-between gap-3">
                            <div>
                              <p class="text-sm font-semibold text-slate-900">Checklist for {{ stage.label || ('Stage ' + (stageIndex + 1)) }}</p>
                              <p class="mt-1 text-xs text-slate-500">These items will be shown only when this stage is active.</p>
                            </div>
                            <button class="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-white" type="button" (click)="addStageChecklistItem(stageIndex)">
                              Add checklist item
                            </button>
                          </div>

                          <div class="mt-3 space-y-3">
                            @for (item of stage.checklistTemplate; track item.itemId; let itemIndex = $index) {
                              <div class="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[1.2fr_180px_1fr_auto]">
                                <input class="rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="item.label" placeholder="Checklist label" />
                                <input class="rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="item.itemId" placeholder="itemId" />
                                <input class="rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="item.helpText" placeholder="Help text" />
                                <div class="flex items-center gap-2">
                                  <label class="inline-flex items-center gap-2 text-xs text-slate-600">
                                    <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" [(ngModel)]="item.required" />
                                    Required
                                  </label>
                                  <button class="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-50" type="button" (click)="removeStageChecklistItem(stageIndex, itemIndex)">
                                    Remove
                                  </button>
                                </div>
                              </div>
                            }
                            @if (!stage.checklistTemplate.length) {
                              <div class="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-center text-sm text-slate-500">
                                No checklist items in this stage yet.
                              </div>
                            }
                          </div>
                        </div>

                        <div class="mt-4 flex items-center justify-between gap-3">
                          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input type="radio" name="defaultStageCode" [value]="stage.code" [checked]="form.defaultStageCode === stage.code" (change)="form.defaultStageCode = stage.code" />
                            Set as default stage
                          </label>
                          <button class="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-50" type="button" (click)="removeStage(stageIndex)">
                            Remove stage
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button class="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50" type="button" [disabled]="loading()" (click)="resetForm()">
                    Reset
                  </button>
                  <button class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" type="button" [disabled]="loading()" (click)="saveTemplate()">
                    {{ form._id ? 'Update Template' : 'Save Template' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="xl:col-span-6">
            <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="border-b border-slate-100 p-5">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 class="text-sm font-semibold text-slate-900">Configured Templates</h2>
                    <p class="mt-1 text-sm text-slate-600">Review the stages that each order type will follow.</p>
                  </div>
                  <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {{ templates().length }} templates
                  </div>
                </div>
              </div>

              <div class="space-y-4 p-5">
                @for (template of templates(); track template._id || template.code) {
                  <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div class="flex flex-wrap items-center gap-2">
                          <span class="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">{{ template.type }}</span>
                          <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">{{ template.area }}</span>
                          @if (template.isDefault) {
                            <span class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">Default</span>
                          }
                          @if (!template.active) {
                            <span class="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-100">Inactive</span>
                          }
                        </div>
                        <h3 class="mt-2 text-base font-semibold text-slate-900">{{ template.name }}</h3>
                        <p class="mt-1 text-xs text-slate-500">{{ template.code }}</p>
                      </div>
                      <div class="flex flex-wrap items-center gap-2">
                        <button class="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50" (click)="edit(template)">Edit</button>
                        <button class="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-50" (click)="remove(template)">Delete</button>
                      </div>
                    </div>

                    <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div class="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">Priority: <span class="font-semibold text-slate-900">{{ template.defaultPriority }}</span></div>
                      <div class="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">SLA: <span class="font-semibold text-slate-900">{{ template.slaDays }} days</span></div>
                      <div class="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">Default stage: <span class="font-semibold text-slate-900">{{ template.defaultStageCode }}</span></div>
                    </div>

                    <div class="mt-4 space-y-3">
                      @for (stage of getOrderedStages(template.stages); track stage.code) {
                        <div class="rounded-xl border border-slate-200 bg-white p-3">
                          <div class="flex flex-wrap items-center gap-2">
                            <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset" [ngClass]="stageColorClass(stage.color)">
                              {{ stage.label }}
                            </span>
                            <span class="text-xs text-slate-500">{{ stage.code }}</span>
                            @if (template.defaultStageCode === stage.code) {
                              <span class="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">Default</span>
                            }
                            @if (stage.isFinal) {
                              <span class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">Final</span>
                            }
                          </div>
                          <p class="mt-2 text-sm text-slate-600">{{ stage.description || 'No description' }}</p>
                          <div class="mt-2 space-y-1">
                            @for (item of stage.checklistTemplate; track item.itemId) {
                              <div class="text-xs text-slate-600">
                                <span class="font-medium text-slate-700">{{ item.label }}</span>
                                <span class="text-slate-400"> - {{ item.itemId }}</span>
                              </div>
                            }
                            @if (!stage.checklistTemplate.length) {
                              <span class="text-xs text-slate-400">No checklist in this stage</span>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                @if (!templates().length) {
                  <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                    No templates configured yet.
                  </div>
                }
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

  readonly stageColors = ['slate', 'blue', 'amber', 'emerald', 'rose', 'violet', 'sky', 'teal', 'orange', 'indigo', 'fuchsia'];
  readonly attachmentTypes = ['VOUCHER', 'INVOICE', 'PAYMENT_PROOF', 'RESERVATION_CONFIRMATION', 'TICKET', 'PASSPORT_COPY', 'OTHER'];

  form: ServiceOrderTemplate = this.createEmptyTemplate();

  async ngOnInit(): Promise<void> {
    await this.loadTemplates();
  }

  createEmptyChecklistItem(): ServiceOrderTemplateChecklistItem {
    return { itemId: '', label: '', required: true, helpText: '' };
  }

  createEmptyStage(order = 1): ServiceOrderTemplateStage {
    return {
      code: `STAGE_${order}`,
      label: '',
      description: '',
      color: 'slate',
      order,
      isFinal: false,
      requireCommentOnEnter: false,
      requireCommentOnComplete: false,
      requiredAttachments: [],
      checklistTemplate: []
    };
  }

  createEmptyTemplate(): ServiceOrderTemplate {
    return {
      name: '',
      code: '',
      active: true,
      isDefault: false,
      type: 'HOTEL',
      area: 'RESERVAS',
      defaultPriority: 'MEDIUM',
      slaDays: 2,
      blocking: true,
      defaultStageCode: 'REQUESTED',
      stages: [
        {
          code: 'REQUESTED',
          label: 'Requested',
          description: 'Initial operational review.',
          color: 'slate',
          order: 1,
          isFinal: false,
          requireCommentOnEnter: false,
          requireCommentOnComplete: false,
          requiredAttachments: [],
          checklistTemplate: []
        },
        {
          code: 'DONE',
          label: 'Done',
          description: 'Workflow completed.',
          color: 'emerald',
          order: 2,
          isFinal: true,
          requireCommentOnEnter: false,
          requireCommentOnComplete: false,
          requiredAttachments: [],
          checklistTemplate: []
        }
      ]
    };
  }

  async loadTemplates(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.templates.set((await this.api.listTemplates()) || []);
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not load templates');
      this.templates.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  addStage(): void {
    this.form = {
      ...this.form,
      stages: [...this.form.stages, this.createEmptyStage(this.form.stages.length + 1)]
    };
  }

  removeStage(index: number): void {
    const stages = this.form.stages.filter((_, i) => i !== index);
    this.form = {
      ...this.form,
      stages,
      defaultStageCode: stages.some((stage) => stage.code === this.form.defaultStageCode)
        ? this.form.defaultStageCode
        : (stages[0]?.code || '')
    };
  }

  addStageChecklistItem(stageIndex: number): void {
    this.form.stages[stageIndex].checklistTemplate.push(this.createEmptyChecklistItem());
    this.form = { ...this.form, stages: [...this.form.stages] };
  }

  removeStageChecklistItem(stageIndex: number, itemIndex: number): void {
    this.form.stages[stageIndex].checklistTemplate.splice(itemIndex, 1);
    this.form = { ...this.form, stages: [...this.form.stages] };
  }

  toggleStageAttachment(stageIndex: number, attachmentType: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const stage = this.form.stages[stageIndex];
    const current = new Set(stage.requiredAttachments || []);
    if (checked) current.add(attachmentType);
    else current.delete(attachmentType);
    stage.requiredAttachments = Array.from(current);
    this.form = { ...this.form, stages: [...this.form.stages] };
  }

  edit(template: ServiceOrderTemplate): void {
    this.form = {
      ...template,
      stages: this.getOrderedStages(template.stages || []).map((stage) => ({
        ...stage,
        checklistTemplate: [...(stage.checklistTemplate || [])],
        requiredAttachments: [...(stage.requiredAttachments || [])]
      }))
    };
  }

  resetForm(): void {
    this.form = this.createEmptyTemplate();
  }

  getOrderedStages(stages: ServiceOrderTemplateStage[] = []): ServiceOrderTemplateStage[] {
    return [...stages].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  stageColorClass(color?: string): string {
    switch (color) {
      case 'blue': return 'bg-blue-50 text-blue-700 ring-blue-200';
      case 'amber': return 'bg-amber-50 text-amber-700 ring-amber-200';
      case 'emerald': return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      case 'rose': return 'bg-rose-50 text-rose-700 ring-rose-200';
      case 'violet': return 'bg-violet-50 text-violet-700 ring-violet-200';
      case 'sky': return 'bg-sky-50 text-sky-700 ring-sky-200';
      case 'teal': return 'bg-teal-50 text-teal-700 ring-teal-200';
      case 'orange': return 'bg-orange-50 text-orange-700 ring-orange-200';
      case 'indigo': return 'bg-indigo-50 text-indigo-700 ring-indigo-200';
      case 'fuchsia': return 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200';
      default: return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  }

  async saveTemplate(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.api.upsertTemplate(this.form);
      await this.loadTemplates();
      this.resetForm();
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not save template');
    } finally {
      this.loading.set(false);
    }
  }

  async remove(template: ServiceOrderTemplate): Promise<void> {
    if (!template._id) return;
    if (!window.confirm(`Delete template ${template.name}?`)) return;
    this.loading.set(true);
    this.error.set('');
    try {
      await this.api.deleteTemplate(template._id);
      await this.loadTemplates();
    } catch (error: any) {
      this.error.set(error?.error?.error || error?.error?.message || 'Could not delete template');
    } finally {
      this.loading.set(false);
    }
  }
}
