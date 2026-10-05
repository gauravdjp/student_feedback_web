import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackFormComponent } from './components/feedback-form/feedback-form.component';
import { FeedbackListComponent } from './components/feedback-list/feedback-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FeedbackFormComponent, FeedbackListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  activeTab: 'form' | 'list' = 'form';
}
