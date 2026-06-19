import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ActivitySubType, ActivityType } from '../../../core/models/activity.model';

@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.scss'],
})
export class ActivityFormComponent implements OnInit, OnDestroy {
  @Output() activityCreated = new EventEmitter<void>();

  form!: FormGroup;
  submitting = false;
  subTypes: ActivitySubType[] = [];
  loadingSubTypes = false;
  error = '';
  private destroy$ = new Subject<void>();

  readonly types: Array<{ value: ActivityType; label: string; icon: string }> = [
    { value: 'transport',    label: 'Transport',    icon: '🚗' },
    { value: 'electricity',  label: 'Electricity',  icon: '⚡' },
    { value: 'food',         label: 'Food',         icon: '🍽️' },
    { value: 'waste',        label: 'Waste',        icon: '🗑️' },
  ];

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      type:     ['transport', Validators.required],
      sub_type: ['', Validators.required],
      value:    [null, [Validators.required, Validators.min(0.001), Validators.max(100000)]],
      unit:     ['km', Validators.required],
      date:     [new Date().toISOString().split('T')[0], [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      notes:    ['', Validators.maxLength(500)],
    });

    // Load sub-types when type changes
    this.form.get('type')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((type: ActivityType) => {
        this.loadSubTypes(type);
        this.form.patchValue({ sub_type: '', unit: '' });
      });

    // Set unit when sub_type changes
    this.form.get('sub_type')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((subTypeKey: string) => {
        const found = this.subTypes.find((s) => s.key === subTypeKey);
        if (found) this.form.patchValue({ unit: found.unit }, { emitEvent: false });
      });

    this.loadSubTypes('transport');
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadSubTypes(type: ActivityType): void {
    this.loadingSubTypes = true;
    this.api.getSubTypes(type).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.subTypes = res.data; this.loadingSubTypes = false; },
      error: () => { this.loadingSubTypes = false; },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.error = '';

    this.api.createActivity(this.form.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.submitting = false;
        this.form.reset({ type: 'transport', date: new Date().toISOString().split('T')[0] });
        this.activityCreated.emit();
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.userMessage || 'Failed to log activity';
      },
    });
  }

  get selectedSubType(): ActivitySubType | undefined {
    return this.subTypes.find((s) => s.key === this.form.get('sub_type')?.value);
  }

  getErrorMessage(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || !ctrl.invalid) return '';
    if (ctrl.hasError('required')) return `${field.replace('_', ' ')} is required`;
    if (ctrl.hasError('min')) return 'Value must be greater than 0';
    if (ctrl.hasError('max')) return 'Value is too large';
    if (ctrl.hasError('maxlength')) return 'Notes must be under 500 characters';
    if (ctrl.hasError('pattern')) return 'Invalid date format (use YYYY-MM-DD)';
    return 'Invalid value';
  }
}
