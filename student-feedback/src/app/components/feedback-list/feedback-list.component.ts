import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../services/feedback.service';
import { Feedback } from '../../models/feedback.model';

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback-list.component.html',
  styleUrl: './feedback-list.component.css'
})
export class FeedbackListComponent implements OnInit {
  feedbackList: Feedback[] = [];
  loading = true;
  errorMessage = '';

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.loadFeedback();
  }

  loadFeedback(): void {
    this.loading = true;
    this.feedbackService.getAllFeedback().subscribe({
      next: (data) => {
        this.feedbackList = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load feedback. Is the server running?';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteFeedback(id: string): void {
    if (confirm('Are you sure you want to delete this feedback?')) {
      this.feedbackService.deleteFeedback(id).subscribe({
        next: () => {
          this.feedbackList = this.feedbackList.filter(f => f._id !== id);
        },
        error: (err) => {
          console.error('Delete failed:', err);
        }
      });
    }
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getRatingClass(rating: number): string {
    if (rating >= 4) return 'rating-high';
    if (rating >= 3) return 'rating-mid';
    return 'rating-low';
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
