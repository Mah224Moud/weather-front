import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../data.service';
import marked from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-llm',
  imports: [CommonModule, FormsModule],
  templateUrl: './llm.component.html',
  styleUrl: './llm.component.css'
})
export class LlmComponent {
  userMessage: string = '';
  response: string = '';
  isWaiting = false;
  sanitizedResponse: SafeHtml = '';

  constructor(
    private service: DataService,
    private sanitizer: DomSanitizer
  ) {}

  get formattedResponse(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      marked.parse(this.response)
    );
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;
    
    this.response = '';
    this.isWaiting = true;
    
    this.service.sendMessage(this.userMessage).subscribe({
      next: (chunk) => {
        this.isWaiting = false;
        this.response += chunk;
      },
      error: (err) => {
        this.isWaiting = false;
        this.response = 'Erreur lors de la communication';
        console.error(err);
      },
      complete: () => this.isWaiting = false
    });
  }
}