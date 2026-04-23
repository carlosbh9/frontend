import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceOrder, ServiceOrderChecklistItem, ServiceOrderStageSnapshot } from '../data-access/service-orders.types';
import { ServiceOrderChecklistComponent } from './service-order-checklist.component';
import { ServiceOrderTimelineComponent } from './service-order-timeline.component';

@Component({
  selector: 'app-service-order-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ServiceOrderChecklistComponent, ServiceOrderTimelineComponent],
  template: `
    @if (!order) {
      <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-inset ring-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          </svg>
        </div>
        <p class="mt-4 text-sm font-semibold text-slate-900">No order selected</p>
        <p class="mt-1 text-sm text-slate-500">Choose a service order from the list to review details, checklist, and activity.</p>
      </div>
    } @else {
      <div class="space-y-2">
        <div class="rounded-xl border border-slate-200 bg-white">
          <div class="border-b border-slate-100 px-3 py-2">
            <div class="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset" [ngClass]="typeClass(order.type)">{{ order.type }}</span>
                  <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">{{ order.area }}</span>
                  <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset" [ngClass]="priorityClass(order.priority)">{{ prettify(order.priority) }}</span>
                  @if (activeStagePendingRequiredCount(order) > 0) {
                    <span class="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                      {{ activeStagePendingRequiredCount(order) }} required pending
                    </span>
                  }
                  @if (activeStageRequiresComment(order)) {
                    <span class="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
                      Comment required
                    </span>
                  }
                </div>
                <h2 class="mt-1 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">{{ getServiceLabel(order) }}</h2>
                <p class="mt-0.5 text-xs text-slate-500">Order ID: <span class="font-mono text-slate-700">{{ order._id }}</span></p>
              </div>

              <div class="w-full xl:w-auto xl:min-w-[340px]">
                <div class="mb-1 flex justify-end">
                  <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                    (click)="close.emit()"
                  >
                    Close
                  </button>
                </div>

                <div class="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                  <div>
                    <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</label>
                    <select class="block w-full rounded-lg bg-white px-2.5 py-1 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [ngModel]="order.status" (ngModelChange)="statusChange.emit($event)">
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="WAITING_INFO">Waiting info</option>
                      <option value="DONE">Done</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Stage</label>
                    <select class="block w-full rounded-lg bg-white px-2.5 py-1 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [ngModel]="order.currentStageCode || ''" (ngModelChange)="emitStageChange($event)">
                      @for (stage of order.stagesSnapshot || []; track stage.code) {
                        <option [value]="stage.code">{{ stage.label }}</option>
                      }
                    </select>
                  </div>

                  <div>
                    <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Assignee</label>
                    <input class="block w-full rounded-lg bg-white px-2.5 py-1 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600" [ngModel]="order.assigneeId || ''" (ngModelChange)="assigneeChange.emit($event || null)" placeholder="Assign owner" />
                  </div>
                </div>

                <details class="mt-1.5 rounded-lg border border-slate-200 bg-slate-50" [attr.open]="shouldExpandStageComment(order) ? true : null">
                  <summary class="flex cursor-pointer list-none items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-700">
                    Stage Transition Comment
                    <span class="text-[11px] font-medium" [ngClass]="activeStageRequiresComment(order) ? 'text-indigo-600' : 'text-slate-500'">
                      {{ activeStageRequiresComment(order) ? 'Required for current stage' : 'Optional context' }}
                    </span>
                  </summary>
                  <div class="border-t border-slate-200 p-2">
                    <textarea class="block min-h-[56px] w-full rounded-lg bg-white px-3 py-1.5 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="stageComment" placeholder="Use this when the stage requires context before entering or completing it."></textarea>
                  </div>
                </details>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-1.5 px-3 py-2 xl:grid-cols-4">
            <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Status</p>
              <span class="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset" [ngClass]="statusClass(order.status)">{{ prettify(order.status) }}</span>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Priority</p>
              <span class="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset" [ngClass]="priorityClass(order.priority)">{{ prettify(order.priority) }}</span>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Due Date</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ order.dueDate ? (order.dueDate | date:'dd/MM/yyyy') : '-' }}</p>
              @if (isOverdue(order.dueDate, order.status)) {
                <p class="mt-0.5 text-xs font-medium text-rose-600">Overdue</p>
              }
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Workflow</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ order.workflowTemplateName || order.workflowTemplateCode || 'No template snapshot' }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Current Stage</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ order.currentStageLabel || order.currentStageCode || '-' }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Assignee</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ order.assigneeId || 'Unassigned' }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Last Status Change</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ order.lastStatusChangeAt ? (order.lastStatusChangeAt | date:'dd/MM/yyyy HH:mm') : '-' }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Last Stage Change</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">{{ order.lastStageChangeAt ? (order.lastStageChangeAt | date:'dd/MM/yyyy HH:mm') : '-' }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white">
          <div class="border-b border-slate-100 px-3 py-2">
            <div class="flex flex-wrap gap-2">
              <button type="button" class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition" [ngClass]="activeTab === 'overview' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" (click)="activeTab = 'overview'">Overview</button>
              <button type="button" class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition" [ngClass]="activeTab === 'workflow' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" (click)="activeTab = 'workflow'">Workflow</button>
              <button type="button" class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition" [ngClass]="activeTab === 'financials' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" (click)="activeTab = 'financials'">Financials</button>
              <button type="button" class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition" [ngClass]="activeTab === 'attachments' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" (click)="activeTab = 'attachments'">Attachments</button>
            </div>
          </div>

          <div class="p-2.5">
            @if (activeTab === 'overview') {
              <div class="space-y-2.5">
                <div>
                  <h3 class="text-sm font-semibold text-slate-900">Sold Service Detail</h3>
                  <p class="mt-0.5 text-xs text-slate-600">Key service data first, with secondary context collapsed to keep the panel short.</p>
                </div>

                <div class="grid grid-cols-2 gap-1.5 lg:grid-cols-3">
                  <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"><p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Service</p><p class="mt-1 text-sm font-semibold text-slate-900">{{ getServiceLabel(order) }}</p></div>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"><p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Category</p><p class="mt-1 text-sm font-semibold text-slate-900">{{ order.sourceSnapshot?.category || '-' }}</p></div>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"><p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">City</p><p class="mt-1 text-sm font-semibold text-slate-900">{{ order.sourceSnapshot?.city || '-' }}</p></div>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"><p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Guest</p><p class="mt-1 text-sm font-semibold text-slate-900">{{ order.sourceSnapshot?.guest || '-' }}</p></div>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"><p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Date</p><p class="mt-1 text-sm font-semibold text-slate-900">{{ order.sourceSnapshot?.date || '-' }}</p></div>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"><p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Day</p><p class="mt-1 text-sm font-semibold text-slate-900">{{ order.sourceSnapshot?.day ?? '-' }}</p></div>
                </div>

                <div class="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                  <div class="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                    <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Base Price</p>
                    <p class="mt-1 text-sm font-semibold text-slate-900">{{ getNumber(order.sourceSnapshot?.priceBase) | number:'1.2-2' }}</p>
                  </div>
                  <div class="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                    <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Estimated Total</p>
                    <p class="mt-1 text-sm font-semibold text-slate-900">{{ getNumber(order.sourceSnapshot?.estimatedTotal) | number:'1.2-2' }}</p>
                  </div>
                  @if (order.sourceSnapshot?.price !== undefined && order.sourceSnapshot?.price !== null) {
                    <div class="rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                      <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Current Price</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">{{ getNumber(order.sourceSnapshot.price) | number:'1.2-2' }}</p>
                    </div>
                  }
                </div>

                @if (order.sourceSnapshot?.notes || order.cancelledAt || order.completedAt || order.cancellationReason) {
                  <details class="rounded-lg border border-slate-200 bg-white">
                    <summary class="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-semibold text-slate-900">
                      Additional Context
                      <span class="text-[11px] font-medium text-slate-500">Notes and status history</span>
                    </summary>
                    <div class="space-y-1.5 border-t border-slate-100 p-3">
                      @if (order.sourceSnapshot?.notes) {
                        <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Notes</p>
                          <p class="mt-1 text-sm text-slate-700">{{ order.sourceSnapshot.notes }}</p>
                        </div>
                      }

                      @if (order.cancelledAt || order.completedAt) {
                        <div class="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                          <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Completed At</p>
                            <p class="mt-1 text-sm text-slate-700">{{ order.completedAt ? (order.completedAt | date:'dd/MM/yyyy HH:mm') : '-' }}</p>
                          </div>
                          <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Cancelled At</p>
                            <p class="mt-1 text-sm text-slate-700">{{ order.cancelledAt ? (order.cancelledAt | date:'dd/MM/yyyy HH:mm') : '-' }}</p>
                          </div>
                        </div>
                      }

                      @if (order.cancellationReason) {
                        <div class="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5">
                          <p class="text-[11px] font-semibold uppercase tracking-wide text-rose-700">Cancellation Reason</p>
                          <p class="mt-1 text-sm text-rose-800">{{ order.cancellationReason }}</p>
                        </div>
                      }
                    </div>
                  </details>
                }

                <details class="rounded-lg border border-slate-200 bg-white">
                  <summary class="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-semibold text-slate-900">
                    Timeline
                    <span class="text-[11px] font-medium text-slate-500">Audit log and status changes</span>
                  </summary>
                  <div class="border-t border-slate-100 p-3">
                    <app-service-order-timeline [logs]="order.auditLogs" />
                  </div>
                </details>
              </div>
            }

            @if (activeTab === 'workflow') {
              <div class="space-y-3">
                <div>
                  <h3 class="text-sm font-semibold text-slate-900">Stage Workflow</h3>
                  <p class="mt-0.5 text-xs text-slate-600">Review stage rules, required inputs, and complete the active checklist before moving forward.</p>
                </div>

                <div class="rounded-lg border border-slate-200 bg-white">
                  <div class="border-b border-slate-100 px-3 py-2.5"><h4 class="text-sm font-semibold text-slate-900">Workflow Stages</h4></div>
                  <div class="space-y-2 p-3">
                    @for (stage of order.stagesSnapshot || []; track stage.code) {
                      <div class="rounded-lg border px-2.5 py-2" [ngClass]="{ 'border-indigo-200 bg-indigo-50': stage.status === 'ACTIVE', 'border-emerald-200 bg-emerald-50': stage.status === 'DONE', 'border-slate-200 bg-white': stage.status === 'PENDING' || stage.status === 'SKIPPED' }">
                        <button
                          type="button"
                          class="flex w-full items-start justify-between gap-3 text-left"
                          (click)="toggleWorkflowStage(stage.code)"
                        >
                          <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-2">
                              <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset" [ngClass]="stage.status === 'ACTIVE' ? 'bg-indigo-100 text-indigo-700 ring-indigo-200' : stage.status === 'DONE' ? 'bg-emerald-100 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-700 ring-slate-200'">{{ stage.label }}</span>
                              <span class="text-xs text-slate-500">{{ stage.code }}</span>
                              <span class="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">{{ stage.status }}</span>
                              @if (stage.checklist.length) {
                                <span class="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                                  {{ getCompletedChecklistCount(stage) }}/{{ stage.checklist.length }} checks
                                </span>
                              }
                            </div>
                          </div>

                          <span class="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-inset ring-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform" [ngClass]="isWorkflowStageExpanded(stage.code) ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
                            </svg>
                          </span>
                        </button>

                        @if (isWorkflowStageExpanded(stage.code)) {
                          <div class="mt-2 space-y-2 border-t border-slate-200/80 pt-2">
                            @if (stage.description) { <p class="text-sm text-slate-600">{{ stage.description }}</p> }
                            @if (stage.requiredAttachments?.length) { <p class="text-xs text-slate-500">Required attachments: {{ stage.requiredAttachments?.join(', ') }}</p> }
                            @if (stage.requireCommentOnEnter || stage.requireCommentOnComplete) {
                              <p class="text-xs text-amber-700">
                                @if (stage.requireCommentOnEnter) { <span>Comment required on enter.</span> }
                                @if (stage.requireCommentOnComplete) { <span class="ml-1">Comment required on complete.</span> }
                              </p>
                            }
                            @if (stage.checklist.length) {
                              <div class="rounded-lg border border-slate-200 bg-white p-2">
                                <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Stage Checklist</p>
                                <app-service-order-checklist [items]="stage.checklist" (toggle)="checklistToggle.emit($event)" />
                              </div>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>

                <div class="rounded-lg border border-slate-200 bg-white">
                  <div class="border-b border-slate-100 px-3 py-2.5">
                    <h4 class="text-sm font-semibold text-slate-900">{{ activeStageLabel(order) }} Summary</h4>
                    <p class="mt-0.5 text-xs text-slate-600">Compact progress view for the current stage while the full checklist stays inside each expanded stage.</p>
                  </div>
                  <div class="p-3">
                    <div class="grid grid-cols-2 gap-1.5">
                      <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                        <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Active Stage</p>
                        <p class="mt-1 text-sm font-semibold text-slate-900">{{ activeStageLabel(order) }}</p>
                      </div>
                      <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                        <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Progress</p>
                        <p class="mt-1 text-sm font-semibold text-slate-900">
                          {{ activeStageCompletedChecklistCount(order) }}/{{ activeStageChecklistCount(order) }}
                        </p>
                      </div>
                      <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                        <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Required Pending</p>
                        <p class="mt-1 text-sm font-semibold text-slate-900">{{ activeStagePendingRequiredCount(order) }}</p>
                      </div>
                      <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                        <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Comment Rules</p>
                        <p class="mt-1 text-xs font-semibold text-slate-900">{{ activeStageCommentRule(order) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            @if (activeTab === 'financials') {
              <div class="space-y-3">
                <div>
                  <h3 class="text-sm font-semibold text-slate-900">Financial Control</h3>
                  <p class="mt-0.5 text-xs text-slate-600">Compact financial snapshot first, then only the editable fields needed to update the order.</p>
                </div>

                <div class="grid grid-cols-2 gap-1.5">
                  <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                    <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Expected Cost</p>
                    <p class="mt-1 text-sm font-semibold text-slate-900">{{ getFinancialNumber(financialsForm.expectedCost) | number:'1.2-2' }}</p>
                  </div>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                    <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Paid Amount</p>
                    <p class="mt-1 text-sm font-semibold text-slate-900">{{ getFinancialNumber(financialsForm.paidAmount) | number:'1.2-2' }}</p>
                  </div>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                    <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Payment Status</p>
                    <p class="mt-1 text-sm font-semibold text-slate-900">{{ prettify(financialsForm.paymentStatus) }}</p>
                  </div>
                  <div class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                    <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500">Currency</p>
                    <p class="mt-1 text-sm font-semibold text-slate-900">{{ financialsForm.currency || '-' }}</p>
                  </div>
                </div>

                <div class="rounded-lg border border-slate-200 bg-white">
                  <div class="space-y-2.5 p-3">
                    <div class="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                      <input class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="financialsForm.supplierName" placeholder="Supplier name" />
                      <input class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="financialsForm.supplierReference" placeholder="Supplier reference" />
                    </div>

                    <div class="grid grid-cols-2 gap-1.5">
                      <input class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="financialsForm.currency" placeholder="Currency" />
                      <select class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="financialsForm.paymentStatus"><option value="NOT_REQUIRED">Not required</option><option value="PENDING">Pending</option><option value="PARTIAL">Partial</option><option value="PAID">Paid</option><option value="REFUNDED">Refunded</option></select>
                      <input class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" type="number" [(ngModel)]="financialsForm.expectedCost" placeholder="Expected cost" />
                      <input class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" type="number" [(ngModel)]="financialsForm.paidAmount" placeholder="Paid amount" />
                    </div>

                    <details class="rounded-lg border border-slate-200 bg-slate-50">
                      <summary class="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-semibold text-slate-900">
                        Billing and payment details
                        <span class="text-[11px] font-medium text-slate-500">Invoice, method and dates</span>
                      </summary>
                      <div class="grid grid-cols-1 gap-1.5 border-t border-slate-200 p-3 md:grid-cols-2">
                        <input class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="financialsForm.invoiceNumber" placeholder="Invoice number" />
                        <select class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="financialsForm.paymentMethod"><option value="OTHER">Other</option><option value="TRANSFER">Transfer</option><option value="CASH">Cash</option><option value="CARD">Card</option><option value="CHECK">Check</option></select>
                        <input class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" type="date" [(ngModel)]="financialsForm.paymentDueDate" />
                        <input class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" type="date" [(ngModel)]="financialsForm.paymentDate" />
                        <input class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 md:col-span-2" type="date" [(ngModel)]="financialsForm.invoiceDate" />
                      </div>
                    </details>

                    <div class="flex justify-end">
                      <button class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700" type="button" (click)="financialsSave.emit(financialsForm)">Save Financials</button>
                    </div>
                  </div>
                </div>
              </div>
            }

            @if (activeTab === 'attachments') {
              <div class="space-y-3">
                <div>
                  <h3 class="text-sm font-semibold text-slate-900">Attachments</h3>
                  <p class="mt-0.5 text-xs text-slate-600">Review registered files first, then expand the upload form only when you need to add a new document.</p>
                </div>

                <div class="rounded-lg border border-slate-200 bg-white">
                  <div class="border-b border-slate-100 px-3 py-2.5"><h4 class="text-sm font-semibold text-slate-900">Registered Files</h4></div>
                  <div class="max-h-[360px] space-y-2 overflow-y-auto p-3">
                    @for (attachment of order.attachments || []; track attachment.attachmentId) {
                      <div class="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 sm:flex-row sm:items-center sm:justify-between">
                        <div class="min-w-0">
                          <div class="flex flex-wrap items-center gap-2">
                            <span class="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">{{ prettify(attachment.type) }}</span>
                            <span class="text-sm font-semibold text-slate-900">{{ attachment.fileName }}</span>
                          </div>
                          <p class="mt-1 text-xs text-slate-500">{{ attachment.notes || attachment.url || '-' }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                          <button class="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50" type="button" (click)="attachmentOpen.emit(attachment.attachmentId)">Open</button>
                          <button class="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-50" type="button" (click)="attachmentRemove.emit(attachment.attachmentId)">Remove</button>
                        </div>
                      </div>
                    }
                    @if (!(order.attachments?.length)) {
                      <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No attachments registered yet.</div>
                    }
                  </div>
                </div>

                <details class="rounded-lg border border-slate-200 bg-white">
                  <summary class="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-semibold text-slate-900">
                    Add New Attachment
                    <span class="text-[11px] font-medium text-slate-500">Upload file or register external URL</span>
                  </summary>
                  <div class="space-y-2 border-t border-slate-100 p-3">
                    <div class="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                      <select class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="attachmentForm.type"><option value="VOUCHER">Voucher</option><option value="INVOICE">Invoice</option><option value="PAYMENT_PROOF">Payment proof</option><option value="RESERVATION_CONFIRMATION">Reservation confirmation</option><option value="TICKET">Ticket</option><option value="PASSPORT_COPY">Passport copy</option><option value="OTHER">Other</option></select>
                      <input class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="attachmentForm.fileName" placeholder="File name" />
                    </div>

                    <input class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" (change)="onAttachmentFileSelected($event)" />

                    <details class="rounded-lg border border-slate-200 bg-slate-50">
                      <summary class="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-semibold text-slate-900">
                        Optional metadata
                        <span class="text-[11px] font-medium text-slate-500">URL and notes</span>
                      </summary>
                      <div class="grid grid-cols-1 gap-1.5 border-t border-slate-200 p-3">
                        <input class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="attachmentForm.url" placeholder="File URL" />
                        <input class="rounded-lg bg-white px-3 py-1.5 text-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600" [(ngModel)]="attachmentForm.notes" placeholder="Notes" />
                      </div>
                    </details>

                    <div class="flex justify-end">
                      <button class="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50" type="button" (click)="addAttachment()">{{ selectedAttachmentFile ? 'Upload Attachment' : 'Add Attachment' }}</button>
                    </div>
                  </div>
                </details>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class ServiceOrderDetailComponent {
  @Input() order: ServiceOrder | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() statusChange = new EventEmitter<ServiceOrder['status']>();
  @Output() stageChange = new EventEmitter<{ stageCode: string; comment: string }>();
  @Output() assigneeChange = new EventEmitter<string | null>();
  @Output() checklistToggle = new EventEmitter<{ itemId: string; done: boolean }>();
  @Output() financialsSave = new EventEmitter<any>();
  @Output() attachmentAdd = new EventEmitter<any>();
  @Output() attachmentUpload = new EventEmitter<{ file: File; attachment: any }>();
  @Output() attachmentOpen = new EventEmitter<string>();
  @Output() attachmentRemove = new EventEmitter<string>();

  financialsForm: any = {};
  attachmentForm: any = { type: 'VOUCHER', fileName: '', url: '', notes: '' };
  selectedAttachmentFile: File | null = null;
  stageComment = '';
  activeTab: 'overview' | 'workflow' | 'financials' | 'attachments' = 'overview';
  private currentOrderId: string | null = null;
  expandedWorkflowStageCode: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order']?.currentValue) {
      const order = changes['order'].currentValue as ServiceOrder;
      const isSameOrder = this.currentOrderId === order._id;

      this.financialsForm = {
        supplierName: order.financials?.supplierName || '',
        supplierReference: order.financials?.supplierReference || '',
        currency: order.financials?.currency || 'USD',
        expectedCost: order.financials?.expectedCost ?? 0,
        paidAmount: order.financials?.paidAmount ?? 0,
        paymentStatus: order.financials?.paymentStatus || 'NOT_REQUIRED',
        paymentMethod: order.financials?.paymentMethod || 'OTHER',
        paymentDueDate: this.toDateInput(order.financials?.paymentDueDate),
        paymentDate: this.toDateInput(order.financials?.paymentDate),
        invoiceNumber: order.financials?.invoiceNumber || '',
        invoiceDate: this.toDateInput(order.financials?.invoiceDate)
      };
      this.attachmentForm = { type: 'VOUCHER', fileName: '', url: '', notes: '' };
      this.selectedAttachmentFile = null;
      if (!isSameOrder) {
        this.stageComment = '';
        this.activeTab = 'overview';
        this.expandedWorkflowStageCode = this.activeStage(order)?.code || order.currentStageCode || order.stagesSnapshot?.[0]?.code || null;
      } else if (!this.expandedWorkflowStageCode || !order.stagesSnapshot?.some((stage) => stage.code === this.expandedWorkflowStageCode)) {
        this.expandedWorkflowStageCode = this.activeStage(order)?.code || order.currentStageCode || order.stagesSnapshot?.[0]?.code || null;
      }
      this.currentOrderId = order._id;
    }
  }

  emitStageChange(stageCode: string): void {
    this.stageChange.emit({ stageCode, comment: this.stageComment });
  }

  addAttachment(): void {
    const cleanedPayload = {
      ...this.attachmentForm,
      fileName: this.attachmentForm.fileName?.trim(),
      url: (this.attachmentForm.url || '').trim(),
      notes: (this.attachmentForm.notes || '').trim()
    };

    if (this.selectedAttachmentFile) {
      this.attachmentUpload.emit({
        file: this.selectedAttachmentFile,
        attachment: {
          ...cleanedPayload,
          fileName: cleanedPayload.fileName || this.selectedAttachmentFile.name
        }
      });
      this.resetAttachmentForm();
      return;
    }

    if (!cleanedPayload.fileName) return;
    this.attachmentAdd.emit({ ...cleanedPayload });
    this.resetAttachmentForm();
  }

  onAttachmentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] || null;
    this.selectedAttachmentFile = file;
    if (file && !this.attachmentForm.fileName?.trim()) {
      this.attachmentForm.fileName = file.name;
    }
  }

  private resetAttachmentForm(): void {
    this.attachmentForm = { type: 'VOUCHER', fileName: '', url: '', notes: '' };
    this.selectedAttachmentFile = null;
  }

  getNumber(value: any): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  getFinancialNumber(value: any): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  getServiceLabel(order: ServiceOrder): string {
    return order?.sourceSnapshot?.name || order?.sourceSnapshot?.route || order?.sourceSnapshot?.category || '-';
  }

  activeStage(order: ServiceOrder): ServiceOrderStageSnapshot | null {
    if (!order?.stagesSnapshot?.length) return null;
    return order.stagesSnapshot.find((stage) => stage.status === 'ACTIVE')
      || order.stagesSnapshot.find((stage) => stage.code === order.currentStageCode)
      || null;
  }

  activeStageChecklist(order: ServiceOrder): ServiceOrderChecklistItem[] {
    const stageChecklist = this.activeStage(order)?.checklist || [];
    if (stageChecklist.length) return stageChecklist;
    return order?.checklist || [];
  }

  activeStageLabel(order: ServiceOrder): string {
    return this.activeStage(order)?.label || order?.currentStageLabel || 'Stage';
  }

  activeStageChecklistCount(order: ServiceOrder): number {
    return this.activeStageChecklist(order).length;
  }

  activeStageCompletedChecklistCount(order: ServiceOrder): number {
    return this.activeStageChecklist(order).filter((item) => item.status === 'DONE').length;
  }

  activeStagePendingRequiredCount(order: ServiceOrder): number {
    return this.activeStageChecklist(order).filter((item) => item.required && item.status !== 'DONE').length;
  }

  activeStageCommentRule(order: ServiceOrder): string {
    const stage = this.activeStage(order);
    if (!stage) return 'No rules';
    if (stage.requireCommentOnEnter && stage.requireCommentOnComplete) return 'Enter and complete';
    if (stage.requireCommentOnEnter) return 'On enter';
    if (stage.requireCommentOnComplete) return 'On complete';
    return 'Optional';
  }

  activeStageRequiresComment(order: ServiceOrder): boolean {
    const stage = this.activeStage(order);
    return !!(stage?.requireCommentOnEnter || stage?.requireCommentOnComplete);
  }

  shouldExpandStageComment(order: ServiceOrder): boolean {
    return this.activeStageRequiresComment(order) || !!this.stageComment.trim();
  }

  toggleWorkflowStage(stageCode: string): void {
    this.expandedWorkflowStageCode = this.expandedWorkflowStageCode === stageCode ? null : stageCode;
  }

  isWorkflowStageExpanded(stageCode: string): boolean {
    return this.expandedWorkflowStageCode === stageCode;
  }

  getCompletedChecklistCount(stage: ServiceOrderStageSnapshot): number {
    return stage?.checklist?.filter((item) => item.status === 'DONE').length || 0;
  }

  prettify(value: string | null | undefined): string {
    if (!value) return '-';
    return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
  }

  isOverdue(dueDate?: string | Date | null, status?: string | null): boolean {
    if (!dueDate) return false;
    if (status === 'DONE' || status === 'CANCELLED') return false;
    return new Date(dueDate).getTime() < Date.now();
  }

  statusClass(status: string | null | undefined): string {
    switch (status) {
      case 'PENDING': return 'bg-slate-100 text-slate-700 ring-slate-200';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 ring-blue-200';
      case 'WAITING_INFO': return 'bg-amber-50 text-amber-700 ring-amber-200';
      case 'DONE': return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      case 'CANCELLED': return 'bg-rose-50 text-rose-700 ring-rose-200';
      default: return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  }

  priorityClass(priority: string | null | undefined): string {
    switch (priority) {
      case 'HIGH': return 'bg-rose-50 text-rose-700 ring-rose-200';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 ring-amber-200';
      case 'LOW': return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      default: return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  }

  typeClass(type: string | null | undefined): string {
    switch (type) {
      case 'HOTEL': return 'bg-violet-50 text-violet-700 ring-violet-200';
      case 'TRANSPORT': return 'bg-sky-50 text-sky-700 ring-sky-200';
      case 'TOUR': return 'bg-indigo-50 text-indigo-700 ring-indigo-200';
      case 'TICKETS': return 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200';
      case 'PREPAYMENT': return 'bg-orange-50 text-orange-700 ring-orange-200';
      case 'INVOICE': return 'bg-teal-50 text-teal-700 ring-teal-200';
      default: return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  }

  private toDateInput(value?: string | Date | null): string {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  }
}
