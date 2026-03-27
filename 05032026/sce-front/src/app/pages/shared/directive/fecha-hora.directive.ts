import { Directive, ElementRef, HostListener, Renderer2 } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: "[sceFechaHora]"
})
export class FechaHoraDirective {
  private readonly mask = "__-__-____ __:__"; // máscara base

  constructor(
    private readonly elementRef: ElementRef<HTMLInputElement>,
    private readonly renderer: Renderer2,
    private readonly control: NgControl
  ) {}

  ngOnInit() {
    this.setValue(this.mask);
  }

  @HostListener("input", ["$event"])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, "");

    let formatted = this.mask.split("");
    let digitIndex = 0;

    for (let i = 0; i < formatted.length; i++) {
      if (formatted[i] === "_") {
        if (digitIndex < raw.length) {
          formatted[i] = raw[digitIndex];
          digitIndex++;
        }
      }
    }

    this.setValue(formatted.join(""));
  }

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    const input = this.elementRef.nativeElement;
    let pos = input.selectionStart ?? 0;

    if (event.key === "Backspace" && pos > 0) {
      event.preventDefault();

      // Si lo que está antes es un separador, saltar atrás
      while (pos > 0 && ["/", "-", " ", ":"].includes(input.value[pos - 1])) {
        pos--;
      }

      if (pos > 0) {
        const chars = input.value.split("");
        chars[pos - 1] = "_"; // reemplazar el dígito por "_"
        this.setValue(chars.join(""));

        // Dejar el cursor en la posición correcta
        this.elementRef.nativeElement.setSelectionRange(pos - 1, pos - 1);
      }
    }
  }

  @HostListener("blur")
  onBlur(): void {
    const value = this.elementRef.nativeElement.value;
    if (!value.includes("_")) {
      const [fecha, hora] = value.split(" ");
      const [dd, MM, yyyy] = fecha.split("/").map(Number);
      const [HH, mm] = hora.split(":").map(Number);

      let valido = true;

      if (dd < 1 || dd > 31) valido = false;
      if (MM < 1 || MM > 12) valido = false;
      if (yyyy < 1000) valido = false;
      if (HH < 0 || HH > 23) valido = false;
      if (mm < 0 || mm > 59) valido = false;

      if (!valido) {
        this.setValue(this.mask);
      }
    }
  }

  private setValue(val: string) {
    this.renderer.setProperty(this.elementRef.nativeElement, "value", val);
    this.control.control?.setValue(val, { emitEvent: false });
  }
}
