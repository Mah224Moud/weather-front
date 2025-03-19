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
import { UserInfo } from "../../models/userInfo";
import { AuthService } from "../../services/auth.service";

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
  userInfo: UserInfo = { email: "", nom: "", prenom: "", id: 0 };
  showScrollButton: boolean = false;

  @ViewChild("conversationContainer")
  private conversationContainer!: ElementRef;

  constructor(
    private http: HttpClient,
    private service: LLMService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  get formattedResponse(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(marked.parse(this.response));
  }

  ngOnInit(): void {
    this.authService.user$.subscribe((user: UserInfo | null) => {
      if (user) {
        this.userInfo = user;
      }
    });

    this.loadMsg(this.userInfo.id);
  }

  /**
   * Loads the messages for a given user
   * @param id the id of the user
   */
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

/**
 * Sends a user message to the bot and handles the response.
 * 
 * This function adds the user's message to the messages array, sets the 
 * waiting state, and initializes an empty response. It then sends the 
 * user's message to the LLMService and subscribes to the response. As 
 * chunks of the response arrive, they are appended to the current response 
 * and the view is scrolled to the bottom. Once the response is complete, 
 * the waiting state is reset, and the conversation is saved. Any errors 
 * encountered during message sending are logged, and the waiting state 
 * is reset.
 */

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
          this.userInfo.id
        );
      },
    });

    this.userMessage = "";
  }

  /**
   * Sanitizes the input message content by converting Markdown to HTML
   * and bypassing Angular's security checks to trust the resulting HTML.
   *
   * @param content The message content in Markdown format.
   * @returns The sanitized HTML content marked as safe for binding.
   */

  sanitizeMessage(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(marked.parse(content));
  }

  ngAfterViewChecked() {}

  /**
   * Scrolls the conversation container to the bottom and shows the "Scroll to Top" button.
   *
   * This function is called after the user sends a message and the bot response is received.
   * The timeout is used to ensure that the container height has been updated before scrolling.
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      if (!this.conversationContainer) return;
      const container = this.conversationContainer.nativeElement;
      container.scrollTop = container.scrollHeight + 100;
      this.showScrollButton = true;
    }, 0);
  }

  /**
   * Smoothly scrolls the conversation container to the top.
   *
   * This function is called when the user clicks the "Scroll to Top" button.
   */
  scrollToTop() {
    const container = this.conversationContainer.nativeElement;
    container.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}
