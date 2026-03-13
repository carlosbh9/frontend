import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';

import {
  Entrance,
  EntrancesService
} from '../../Services/entrances.service';
import { HasPermissionsDirective } from '../../Services/AuthService/has-permissions.directive';

@Component({
  selector: 'app-entrances',
  standalone: true,
  imports: [CommonModule, FormsModule, HasPermissionsDirective],
  templateUrl: './entrances.component.html',
  styleUrl: './entrances.component.css'
})
export class EntrancesComponent implements OnInit {
  readonly entrances = signal<Entrance[]>([]);
  readonly filterText = signal('');
  readonly filterYear = signal('2026');

  readonly showAddModal = signal(false);
  readonly showEditModal = signal(false);

  readonly isLoading = signal(false);
  readonly isCreating = signal(false);
  readonly isUpdating = signal(false);
  readonly isDeleting = signal(false);

  readonly filteredEntrances = computed(() => {
    const search = this.normalizeText(this.filterText());
    const year = this.filterYear();

    return this.entrances().filter((entrance) => {
      const matchesText =
        !search ||
        this.normalizeText(entrance.description).includes(search) ||
        this.normalizeText(entrance.take_note).includes(search);

      const matchesYear = !year || entrance.year === year;

      return matchesText && matchesYear;
    });
  });

  newEntrance: Entrance = this.createEmptyEntrance();
  selectedEntrance: Entrance = this.createEmptyEntranceWithId();

  constructor(private readonly entrancesService: EntrancesService) {}

  async ngOnInit(): Promise<void> {
    await this.fetchEntrances();
  }

  private createEmptyEntrance(): Entrance {
    return {
      description: '',
      price_pp: 0,
      childRate: {
        pp: 0,
        upTo: null
      },
      take_note: '',
      year: ''
    };
  }

  private createEmptyEntranceWithId(): Entrance {
    return {
      _id: '',
      ...this.createEmptyEntrance()
    };
  }

  private normalizeText(value: string | null | undefined): string {
    return String(value ?? '').trim().toLowerCase();
  }

  private cloneEntrance(entrance: Partial<Entrance>): Entrance {
    return {
      _id: entrance._id ?? '',
      description: entrance.description ?? '',
      price_pp: Number(entrance.price_pp ?? 0),
      childRate: {
        pp: Number(entrance.childRate?.pp ?? 0),
        upTo:
          entrance.childRate?.upTo != null
            ? Number(entrance.childRate.upTo)
            : null
      },
      take_note: entrance.take_note ?? '',
      year: String(entrance.year ?? '')
    };
  }

  private sanitizeEntrancePayload(entrance: Entrance): Entrance {
    return {
      ...entrance,
      description: entrance.description.trim(),
      take_note: entrance.take_note.trim(),
      year: String(entrance.year ?? '').trim(),
      price_pp: Number(entrance.price_pp ?? 0),
      childRate: {
        pp: Number(entrance.childRate?.pp ?? 0),
        upTo:
          entrance.childRate?.upTo != null
            ? Number(entrance.childRate.upTo)
            : null
      }
    };
  }

  private isValidEntrance(entrance: Entrance): boolean {
    return !!entrance.description.trim() && !!String(entrance.year).trim();
  }

  async fetchEntrances(): Promise<void> {
    this.isLoading.set(true);

    try {
      const data = await this.entrancesService.getAllEntrances();
      this.entrances.set(Array.isArray(data) ? data.map((item) => this.cloneEntrance(item)) : []);
    } catch (error) {
      console.error('Error fetching entrances', error);
      this.entrances.set([]);
      toast.error('Unable to load entrances');
    } finally {
      this.isLoading.set(false);
    }
  }

  onYearChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.filterYear.set(String(selectElement.value || ''));
  }

  filterEntrances(): void {
    // el filtering ahora lo resuelve computed()
    // se mantiene el método para no romper tu HTML actual
    this.filterText.set(this.filterText());
  }

  onFilterTextChange(value: string): void {
    this.filterText.set(value);
  }

  confirmDelete(id: string): void {
    if (!id || this.isDeleting()) return;

    toast('Are you sure you want to delete this record?', {
      action: {
        label: 'Confirm',
        onClick: async () => {
          await this.deleteEntrance(id);
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      },
      position: 'bottom-center'
    });
  }

  async deleteEntrance(id: string): Promise<void> {
    if (!id) return;

    this.isDeleting.set(true);

    try {
      await this.entrancesService.deleteEntrance(id);
      this.entrances.update((items) => items.filter((item) => item._id !== id));
      toast.success('Record deleted');
    } catch (error) {
      console.error('Error deleting entrance', error);
      toast.error('Unable to delete record');
    } finally {
      this.isDeleting.set(false);
    }
  }

  openEditModal(entrance: Entrance): void {
    this.selectedEntrance = this.cloneEntrance(entrance);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedEntrance = this.createEmptyEntranceWithId();
  }

  openModal(): void {
    this.newEntrance = this.createEmptyEntrance();
    this.showAddModal.set(true);
  }

  closeModal(): void {
    this.showAddModal.set(false);
    this.newEntrance = this.createEmptyEntrance();
  }

  async onSubmit(): Promise<void> {
    const payload = this.sanitizeEntrancePayload(this.newEntrance);

    if (!this.isValidEntrance(payload)) {
      toast.error('Description and year are required');
      return;
    }

    this.isCreating.set(true);

    try {
      const created = await this.entrancesService.createEntrance(payload);
      this.entrances.update((items) => [this.cloneEntrance(created), ...items]);
      this.showAddModal.set(false);
      this.newEntrance = this.createEmptyEntrance();
      toast.success('Record created');
    } catch (error) {
      console.error('Error adding entrance', error);
      toast.error('Error adding entrance');
    } finally {
      this.isCreating.set(false);
    }
  }

  async onEditSubmit(): Promise<void> {
    const id = this.selectedEntrance._id ?? '';
    const payload = this.sanitizeEntrancePayload(this.selectedEntrance);

    if (!id) {
      toast.error('Invalid entrance selected');
      return;
    }

    if (!this.isValidEntrance(payload)) {
      toast.error('Description and year are required');
      return;
    }

    this.isUpdating.set(true);

    try {
      const updated = await this.entrancesService.updateEntrance(id, payload);

      this.entrances.update((items) =>
        items.map((item) => (item._id === id ? this.cloneEntrance(updated) : item))
      );

      this.showEditModal.set(false);
      this.selectedEntrance = this.createEmptyEntranceWithId();
      toast.success('Record updated');
    } catch (error) {
      console.error('Error updating entrance', error);
      toast.error('Error updating entrance');
    } finally {
      this.isUpdating.set(false);
    }
  }
}
