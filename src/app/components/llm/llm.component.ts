import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { LLMService } from "../../services/llm.service";
import marked from "marked";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import { Historique } from "../../models/historique";

@Component({
  selector: "app-llm",
  imports: [CommonModule, FormsModule],
  templateUrl: "./llm.component.html",
  styleUrls: ["./llm.component.css"],
})
export class LlmComponent implements AfterViewChecked {
  userMessage: string = "";
  response: string = "";
  isWaiting = false;
  messages: { content: string; type: string }[] = [];
  historiques: Historique[] = [];
  sanitizedResponse: SafeHtml = "";
  userID: number = 12345;
  showScrollButton: boolean = false;

  @ViewChild("conversationContainer")
  private conversationContainer!: ElementRef;

  constructor(
    private http: HttpClient,
    private service: LLMService,
    private sanitizer: DomSanitizer
  ) {}

  get formattedResponse(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(marked.parse(this.response));
  }

  ngOnInit(): void {
    this.loadMsg(this.userID);
  }

  private loadMsg(id: number): void {
    this.service.getUserMessages(id).subscribe({
      next: (response) => {
        this.historiques = response;
        console.log(this.historiques);
        this.historiques.forEach((item) => {
          this.messages.push({ content: item.requete, type: "user" });
          this.messages.push({ content: item.reponse, type: "bot" });
        });
        this.scrollToBottom();
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des msg:", err);
      },
    });
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    this.messages.push({ content: this.userMessage, type: "user" });
    this.isWaiting = true;
    this.response = "";

    const botMessageIndex =
      this.messages.push({ content: "", type: "bot" }) - 1;

    this.service.sendMessage(this.userMessage).subscribe({
      next: (chunk) => {
        this.response += chunk;
        this.scrollToBottom();
        this.messages[botMessageIndex].content = this.response;
      },
      error: (err) => {
        this.isWaiting = false;
        console.error(err);
      },
      complete: () => {
        this.isWaiting = false;
        console.log("Message final = " + this.response);
        console.log(
          "input final = " + this.messages[botMessageIndex - 1].content
        );
        this.service.saveConversation(
          this.messages[botMessageIndex - 1].content,
          this.response,
          this.userID
        );
      },
    });

    this.userMessage = "";
  }

  sanitizeMessage(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(marked.parse(content));
  }

  ngAfterViewChecked() {}

  private scrollToBottom(): void {
    setTimeout(() => {
      if (!this.conversationContainer) return;
      const container = this.conversationContainer.nativeElement;
      container.scrollTop = container.scrollHeight + 100;
      this.showScrollButton = true;
    }, 0);
  }

  scrollToTop() {
    const container = this.conversationContainer.nativeElement;
    container.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}
