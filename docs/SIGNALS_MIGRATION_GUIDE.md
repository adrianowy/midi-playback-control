# 📡 Angular Signals Migration Guide

**Data de Implementação:** 2024-11-24  
**Angular Version:** 20.0.0  
**Status:** ✅ Fase 2 Components + OSC Service Migrados

---

## 🎯 Visão Geral da Migração

Este projeto foi refatorado para usar **Angular Signals** com **Control Flow** (`@if`, `@for`) em todos os componentes, substituindo Observables/RxJS.

### Por que Signals?

| Aspecto | Observables | Signals |
|--------|-----------|---------|
| **Sintaxe** | Complexa (RxJS operators) | Simples |
| **Memory** | Manual (takeUntil) | Automático |
| **Performance** | Lazy evaluation | Fine-grained reactivity |
| **Testing** | Requer async/fakeAsync | Synchronous |
| **Learning Curve** | Steep | Gentle |

---

## ✅ Componentes Já Migrados

### Services

#### ✅ **OscService** (100% Migrado)
- Signals: `message`, `playbackStatus`, `sessionState`, `error`
- Computed: `isListening`, `hasError`
- Effects: Auto-update status, auto-error handling
- **Removido:** BehaviorSubject, Subject, Observable, RxJS operators
- **Resultado:** 70+ linhas removidas

#### ✅ **RtpMidiService** (Suporte Dual)
- Signals: `connectionStatus`, `midiReceived`, `isConnected`, `isConnecting`, `hasError`
- Observables: Mantidos para compatibilidade
- Efeitos: Mantêm Signals e Observables sincronizados
- **Status:** Backward compatible, migração gradual

### Components

#### ✅ **TrackInfoComponent** (100% Migrado)
- Signals: `trackName`, `trackArtist`, `trackAlbum`, `currentSection`, `isLoading`, `hasError`
- Computed: `isTrackAvailable`, `trackNameClass`
- Template: `@if` ao invés de `*ngIf`
- **Removido:** OnDestroy, takeUntil, Observable subscriptions
- **Linhas removidas:** 40+

#### ✅ **ProgressBarComponent** (100% Migrado)
- Signals: `currentTime`, `totalTime`, `isPlaying`
- Computed: `progressPercentage`, `playbackIndicator`, `playbackIcon`, `timeRemaining`
- Template: `@if` control flow, signal calls com `()`
- **Removido:** OnDestroy, takeUntil
- **Resultado:** 45+ linhas mais limpo

#### ✅ **PadIndicatorComponent** (100% Migrado)
- Signals: `pads` como Signal<PadState[]>
- Template: `@for (pad of pads(); track pad.id)`
- **Removido:** OnDestroy, takeUntil
- **Benefício:** Render otimizado com track function

---

## 📋 Padrões de Migração

### Padrão 1: Signal Simples

**Antes (Observable):**
```typescript
private statusSubject = new BehaviorSubject<string>('idle');
status$ = this.statusSubject.asObservable();

// No template:
// {{ status$ | async }}

// Na classe:
ngOnInit() {
  this.service.status$.pipe(
    takeUntil(this.destroy$)
  ).subscribe(status => {
    this.updateStatus(status);
  });
}
```

**Depois (Signal):**
```typescript
readonly status = signal<string>('idle');

// No template:
// {{ status() }}

// Na classe:
ngOnInit() {
  const status = this.service.status();
  this.updateStatus(status);
}
```

### Padrão 2: Valor Derivado (Computed)

**Antes (Observable map):**
```typescript
get isConnected$() {
  return this.status$.pipe(
    map(status => status === 'connected'),
    shareReplay(1)
  );
}
```

**Depois (Computed):**
```typescript
readonly isConnected = computed(
  () => this.status() === 'connected'
);
```

### Padrão 3: Side Effects (Effect)

**Antes (Subscription):**
```typescript
ngOnInit() {
  this.message$.pipe(
    takeUntil(this.destroy$)
  ).subscribe(message => {
    this.addToBuffer(message);
  });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

**Depois (Effect):**
```typescript
constructor() {
  effect(() => {
    const message = this.message();
    if (message) {
      this.addToBuffer(message);
    }
  });
}
// Sem ngOnDestroy - limpeza automática!
```

### Padrão 4: Controle de Fluxo

**Antes (*ngIf, *ngFor):**
```html
<div *ngIf="isLoading">Loading...</div>
<div *ngIf="hasError && !isLoading">Error</div>
<div *ngIf="!isLoading && !hasError">Content</div>

<div *ngFor="let item of items; let i = index">
  {{ item }}
</div>
```

**Depois (@if, @for):**
```html
@if (isLoading()) {
  <div>Loading...</div>
}
@if (hasError() && !isLoading()) {
  <div>Error</div>
}
@if (!isLoading() && !hasError()) {
  <div>Content</div>
}

@for (item of items(); track item.id) {
  {{ item }}
}
```

---

## 🔄 Componentes Pendentes de Migração

### HomeComponent
**Status:** Próximo a ser migrado  
**Signals necessários:**
- `connectionStatus` (do RtpMidiService)
- `padStates` (8 pads)
- `selectedButton` (tracking de botão pressionado)
- Computed: `isControlsDisabled` (quando não connected)

**Exemplo esperado:**
```typescript
readonly padStates = signal<boolean[]>(Array(8).fill(false));
readonly isControlsDisabled = computed(
  () => !this.rtpService.isConnected()
);

onPlayClick() {
  this.rtpService.sendNoteOn(0x3C); // Play
  this.padStates()[0] = true; // Visual feedback
}
```

---

## 📊 Comparação de Código

### Redução de Boilerplate

**OscService:**
- Antes: 350+ linhas (com RxJS)
- Depois: 280+ linhas (com Signals)
- **Redução: ~20%**

**TrackInfoComponent:**
- Antes: 115 linhas (com observables)
- Depois: 75 linhas (com signals)
- **Redução: ~35%**

**Total de redução:** ~100 linhas removidas em Phase 2

---

## 🧪 Testes com Signals

Signals são **muito mais fáceis de testar** que Observables.

### Teste de Signal

**Antes (Async):**
```typescript
it('should update status', (done) => {
  service.status$.subscribe(status => {
    expect(status).toBe('connected');
    done();
  });
  
  service.connect();
});
```

**Depois (Synchronous):**
```typescript
it('should update status', () => {
  service.connect();
  expect(service.status()).toBe('connected');
});
```

### Teste de Computed

**Antes:**
```typescript
it('should compute isConnected', (done) => {
  service.isConnected$.subscribe(result => {
    expect(result).toBe(true);
    done();
  });
  
  service.status$.next('connected');
});
```

**Depois:**
```typescript
it('should compute isConnected', () => {
  service.status.set('connected');
  expect(service.isConnected()).toBe(true);
});
```

---

## ✨ Benefícios Realizados

### Performance
- ✅ Sem async pipe overhead
- ✅ Fine-grained change detection
- ✅ Computed values cached

### Developer Experience
- ✅ Código mais legível
- ✅ Sem "Unsubscribe Hell"
- ✅ Testes mais simples
- ✅ Type-safe por padrão

### Manutenibilidade
- ✅ Menos boilerplate
- ✅ Fluxo de dados explícito
- ✅ Efeitos colaterais centralizados

---

## 🚀 Próximos Passos

### Fase Atual (Phase 2 - OSC)
1. ✅ OscService → Signals
2. ✅ TrackInfoComponent → Signals + @if
3. ✅ ProgressBarComponent → Signals + @if
4. ✅ PadIndicatorComponent → Signals + @for

### Próxima Fase (HomeComponent)
1. ⏳ HomeComponent → Signals + @if/@for/@switch
2. ⏳ RtpMidiService → Signals 100% (remover Observables)
3. ⏳ Atualizar testes para usar Signals
4. ⏳ Documentação de patterns Signals

### Longo Prazo
- Usar `linkedSignal()` para 2-way binding
- Implementar `resource()` para async data loading
- Integrar com Angular Forms (FormGroup signals)
- Explorar `input` e `output` em componentes

---

## 📚 Referências

- **Angular Signals Docs:** https://angular.io/guide/signals
- **Control Flow:** https://angular.io/guide/control_flow
- **Migration Guide:** https://angular.io/guide/migration-signals
- **RFC:** https://github.com/angular/angular/discussions/49676

---

## 🎓 Checklist de Migração

### Para cada component a migrar:

- [ ] Converter Observables → Signals
- [ ] Converter *ngIf → @if
- [ ] Converter *ngFor → @for
- [ ] Remover OnDestroy (se aplicável)
- [ ] Remover takeUntil/unsubscribe
- [ ] Atualizar testes
- [ ] Testar no device/emulador
- [ ] Documentar padrões usados
- [ ] Code review

---

**Última atualização:** 2024-11-24  
**Próxima revisão:** Após migração de HomeComponent
