import {
  Component,
  inject,
  signal,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatbotService, ChatbotRoomInfo } from '../../../core/services/chatbot.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  rooms?: ChatbotRoomInfo[];
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Floating bubble -->
    @if (!isOpen()) {
      <button
        (click)="open()"
        [title]="i18n.t.chatbot.open"
        class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-riad-600 hover:bg-riad-700
               shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center
               text-white animate-bounce-subtle focus:outline-none focus:ring-2 focus:ring-riad-400">
        <!-- Chat icon -->
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
      </button>
    }

    <!-- Chat window -->
    @if (isOpen()) {
      <div
        class="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] flex flex-col
               rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300
               bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
        style="height: 520px; max-height: calc(100vh - 3rem);">

        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 bg-riad-600 text-white shrink-0">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span class="font-display font-bold text-sm">ر</span>
            </div>
            <div>
              <p class="font-semibold text-sm leading-none">{{ i18n.t.chatbot.title }}</p>
              <span class="text-xs text-riad-200">Riad Lee</span>
            </div>
          </div>
          <button (click)="close()"
                  [title]="i18n.t.chatbot.close"
                  class="p-1 rounded-lg hover:bg-white/20 transition-colors focus:outline-none">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div #messagesContainer
             class="flex-1 overflow-y-auto px-3 py-4 space-y-4 scroll-smooth"
             [class.rtl-layout]="i18n.isRtl()">
          @for (msg of messages(); track msg.timestamp) {
            <div [class.flex-row-reverse]="msg.role === 'user'"
                 class="flex gap-2 items-end">

              <!-- Avatar -->
              @if (msg.role === 'assistant') {
                <div class="w-7 h-7 rounded-full bg-riad-600 flex items-center justify-center shrink-0">
                  <span class="text-white text-xs font-display font-bold">ر</span>
                </div>
              }

              <div [class.items-end]="msg.role === 'user'"
                   class="flex flex-col gap-1 max-w-[78%]">
                <!-- Text bubble -->
                <div
                  [class.bg-riad-600]="msg.role === 'user'"
                  [class.text-white]="msg.role === 'user'"
                  [class.rounded-br-sm]="msg.role === 'user'"
                  [class.bg-gray-100]="msg.role === 'assistant'"
                  [class.dark:bg-gray-800]="msg.role === 'assistant'"
                  [class.text-gray-800]="msg.role === 'assistant'"
                  [class.dark:text-gray-100]="msg.role === 'assistant'"
                  [class.rounded-bl-sm]="msg.role === 'assistant'"
                  class="px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm">
                  {{ msg.text }}
                </div>

                <!-- Room cards -->
                @if (msg.rooms && msg.rooms.length > 0) {
                  <div class="w-full space-y-2 mt-1">
                    @for (room of msg.rooms; track room.id) {
                      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                                  rounded-xl overflow-hidden shadow-sm text-xs">
                        @if (room.coverPhotoUrl) {
                          <img [src]="room.coverPhotoUrl" [alt]="room.name"
                               class="w-full h-20 object-cover"/>
                        } @else {
                          <div class="w-full h-20 bg-riad-100 dark:bg-gray-700 flex items-center justify-center">
                            <svg class="w-8 h-8 text-riad-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                          </div>
                        }
                        <div class="p-2">
                          <p class="font-semibold text-gray-900 dark:text-white truncate">{{ room.name }}</p>
                          <p class="text-gray-500 dark:text-gray-400 truncate text-xs">{{ room.type }}</p>
                          <div class="flex items-center justify-between mt-1">
                            <span class="font-bold text-riad-600">
                              {{ room.pricePerNight | number:'1.0-0' }} MAD
                              <span class="font-normal text-gray-500 dark:text-gray-400">{{ i18n.t.chatbot.perNight }}</span>
                            </span>
                            <span class="flex items-center gap-0.5 text-gray-500 dark:text-gray-400">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                              </svg>
                              {{ room.capacity }} {{ i18n.t.chatbot.capacity }}
                            </span>
                          </div>
                          <div class="flex items-center justify-between mt-1.5">
                            <span
                              [class.text-emerald-600]="room.available"
                              [class.text-red-500]="!room.available"
                              class="font-medium">
                              {{ room.available ? i18n.t.chatbot.available : i18n.t.chatbot.unavailable }}
                            </span>
                            <a [routerLink]="['/chambres', room.id]"
                               (click)="close()"
                               class="text-riad-600 hover:text-riad-700 font-medium hover:underline">
                              {{ i18n.t.chatbot.viewRoom }} →
                            </a>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- Typing indicator -->
          @if (isTyping()) {
            <div class="flex gap-2 items-end">
              <div class="w-7 h-7 rounded-full bg-riad-600 flex items-center justify-center shrink-0">
                <span class="text-white text-xs font-display font-bold">ر</span>
              </div>
              <div class="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div class="flex gap-1 items-center">
                  <span class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay:0ms"></span>
                  <span class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay:150ms"></span>
                  <span class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay:300ms"></span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Quick suggestions (only when no messages sent yet) -->
        @if (messages().length === 1) {
          <div class="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
            @for (suggestion of suggestions(); track suggestion) {
              <button (click)="sendSuggestion(suggestion)"
                      class="text-xs px-3 py-1.5 rounded-full border border-riad-200 dark:border-riad-800
                             text-riad-600 dark:text-riad-400 hover:bg-riad-50 dark:hover:bg-riad-950
                             transition-colors whitespace-nowrap">
                {{ suggestion }}
              </button>
            }
          </div>
        }

        <!-- Input -->
        <div class="px-3 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <form (ngSubmit)="send()" class="flex gap-2">
            <input
              #inputEl
              [(ngModel)]="userInput"
              name="message"
              [placeholder]="i18n.t.chatbot.placeholder"
              [disabled]="isTyping()"
              maxlength="500"
              autocomplete="off"
              class="flex-1 text-sm rounded-xl border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     px-3 py-2 focus:outline-none focus:ring-2 focus:ring-riad-400
                     placeholder-gray-400 disabled:opacity-50"
              [dir]="i18n.isRtl() ? 'rtl' : 'ltr'"/>
            <button type="submit"
                    [disabled]="!userInput.trim() || isTyping()"
                    class="w-10 h-10 rounded-xl bg-riad-600 hover:bg-riad-700 disabled:opacity-50
                           text-white flex items-center justify-center transition-colors shrink-0
                           focus:outline-none focus:ring-2 focus:ring-riad-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .animate-bounce-subtle {
      animation: bounce-subtle 3s infinite;
    }
    @keyframes bounce-subtle {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-6px); }
    }
  `],
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  readonly i18n    = inject(I18nService);
  readonly theme   = inject(ThemeService);
  private readonly chatbot = inject(ChatbotService);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') private inputEl!: ElementRef<HTMLInputElement>;

  readonly isOpen   = signal(false);
  readonly isTyping = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
  userInput = '';

  private shouldScroll = false;

  ngOnInit() {
    this.addWelcomeMessage();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  open() {
    this.isOpen.set(true);
    this.shouldScroll = true;
    setTimeout(() => this.inputEl?.nativeElement?.focus(), 100);
  }

  close() {
    this.isOpen.set(false);
  }

  send() {
    const text = this.userInput.trim();
    if (!text || this.isTyping()) return;

    this.addMessage('user', text);
    this.userInput = '';
    this.isTyping.set(true);
    this.shouldScroll = true;

    this.chatbot.sendMessage(text, this.i18n.lang()).subscribe({
      next: (resp) => {
        this.isTyping.set(false);
        if (resp?.data) {
          this.addMessage('assistant', resp.data.message, resp.data.rooms ?? undefined);
        } else {
          this.addMessage('assistant', this.i18n.t.chatbot.error);
        }
        this.shouldScroll = true;
      },
      error: () => {
        this.isTyping.set(false);
        this.addMessage('assistant', this.i18n.t.chatbot.error);
        this.shouldScroll = true;
      },
    });
  }

  sendSuggestion(text: string) {
    this.userInput = text;
    this.send();
  }

  suggestions() {
    const lang = this.i18n.lang();
    return {
      fr: ['Chambres disponibles ?', 'Quels sont les tarifs ?', 'Où êtes-vous situés ?', 'Comment réserver ?'],
      en: ['Available rooms?', 'What are the prices?', 'Where are you located?', 'How to book?'],
      ar: ['الغرف المتاحة؟', 'ما هي الأسعار؟', 'أين موقعكم؟', 'كيف أحجز؟'],
      es: ['¿Habitaciones disponibles?', '¿Cuáles son los precios?', '¿Dónde están ubicados?', '¿Cómo reservar?'],
    }[lang] ?? [];
  }

  private addWelcomeMessage() {
    this.messages.set([{
      role: 'assistant',
      text: this.i18n.t.chatbot.welcome,
      timestamp: new Date(),
    }]);
  }

  private addMessage(role: 'user' | 'assistant', text: string, rooms?: ChatbotRoomInfo[]) {
    this.messages.update(msgs => [...msgs, { role, text, rooms, timestamp: new Date() }]);
  }

  private scrollToBottom() {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
