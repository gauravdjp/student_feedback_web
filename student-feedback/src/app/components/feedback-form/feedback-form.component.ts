import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeedbackService } from '../../services/feedback.service';
import { Feedback } from '../../models/feedback.model';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './feedback-form.component.html',
  styleUrl: './feedback-form.component.css'
})
export class FeedbackFormComponent {
  feedbackForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  hoveredRating = 0;

  courses = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Computer Science',
    'English',
    'History',
    'Biology',
    'Economics'
  ];

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService
  ) {
    this.feedbackForm = this.fb.group({
      studentName: ['', [Validators.required, Validators.minLength(2)]],
      studentId: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]],
      course: ['', Validators.required],
      teacherName: ['', [Validators.required, Validators.minLength(2)]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comments: [''],
      suggestions: ['']
    });
  }

  setRating(star: number): void {
    this.feedbackForm.patchValue({ rating: star });
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.feedbackForm.invalid) {
      return;
    }

    const feedback: Feedback = this.feedbackForm.value;

    this.feedbackService.submitFeedback(feedback).subscribe({
      next: () => {
        this.successMessage = '✅ Feedback submitted successfully!';
        this.feedbackForm.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.errorMessage = '❌ Failed to submit feedback. Please try again.';
        console.error(err);
      }
    });
  }

  get f() {
    return this.feedbackForm.controls;
  }
}
