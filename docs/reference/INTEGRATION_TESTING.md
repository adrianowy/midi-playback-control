# RTP-MIDI Service - Integration Testing Guide

## 🎯 Objetivo
Documentar como testar a integração do `RtpMidiService` com o Playback (MultiTracks.com) no iPad.

## 📋 Pré-requisitos
- iPad com Playback instalado (versão 2.5+)
- Android com este aplicativo instalado (ou dev environment com Ionic)
- iPad e Android na **mesma rede Wi-Fi local**
- IP do iPad conhecido (ex: 192.168.1.100)

## 🚀 Setup para Testes

### iPad - Ativar WiFi MIDI no Playback
1. Abrir **Playback** no iPad
2. Ir para **Settings (⚙️)**
3. Navegar para **MIDI > Network Session**
4. **Ativar** Network Session
5. O iPad deve exibir status "Listening" na porta 5004

### Android - Configurar IP do iPad
1. Editar `src/app/features/home/home.component.ts`
2. Atualizar `IPAD_IP` com o IP real:
```typescript
private readonly IPAD_IP = '192.168.1.XXX'; // Seu IP
```
3. Build e deploy no Android

## 🧪 Teste 1: Conexão e Handshake

### Objetivo
Validar que o handshake AppleMIDI ocorre corretamente.

### Passos
1. Abrir app no Android
2. Verificar console para logs: `[RTP-MIDI] Connected to Playback`
3. Verificar que a conexão status muda de "Connecting" para "Connected"

### Resultado Esperado
- ✅ Status de conexão mostra "Connected to iPad"
- ✅ Botões ficam habilitados (não mais desabilitados)
- ✅ Sem mensagens de erro

### Troubleshooting
| Sintoma | Causa | Solução |
|---------|-------|---------|
| Timeout na conexão | iPad não está escutando | Verificar Settings > MIDI no Playback |
| "Connection refused" | IP errado | Confirmar IP no Settings do iPad |
| Handshake fails | Porta errada | Usar porta 5004 (padrão) |

## 🎵 Teste 2: Play/Pause (Comandos Básicos)

### Objetivo
Validar envio de comandos MIDI básicos.

### Passos
1. Garantir conexão ativa
2. Selecionar uma música no Playback para reprodução
3. Clicar botão **PLAY** no Android
4. Música deve começar a tocar no iPad
5. Clicar botão **PAUSE** no Android
6. Música deve pausar no iPad

### Resultado Esperado
- ✅ Música toca ao clicar PLAY
- ✅ Música pausa ao clicar PAUSE
- ✅ Sem latência perceptível (< 100ms)
- ✅ Console mostra: `Sending MIDI Note On: note=60, velocity=127`

### Notas MIDI Esperadas
```
Play  -> 0x3C (60)   [0x90, 0x3C, 0x7F]
Pause -> 0x3D (61)   [0x90, 0x3D, 0x7F]
Stop  -> 0x3E (62)   [0x90, 0x3E, 0x7F]
```

## 🔄 Teste 3: Loop Commands

### Objetivo
Validar comandos de loop e repetição.

### Passos
1. Iniciar reprodução de música no iPad
2. Clicar **LOOP SECTION** (📍)
   - Deve ativar loop de seção específica
3. Clicar **REPEAT** (🔁)
   - Deve alternar entre repeat modes (Off, Once, Twice, etc)
4. Clicar **LOOP INFINITO** (∞)
   - Deve ativar repeat infinito

### Resultado Esperado
- ✅ Loop Section ativa loop visual no Playback
- ✅ Repeat cicla entre modos
- ✅ Loop Infinito toca música repetidamente

## 🎹 Teste 4: Pads

### Objetivo
Validar controle de pads (Note On com toggle).

### Passos
1. Clicar primeiro pad (**1**)
   - Deve ficar verde/ativo
   - Console: `Pad 1 toggled - ON`
2. Clicar novamente
   - Deve voltar ao estado original
   - Console: `Pad 1 toggled - OFF`
3. Testar todos 8 pads

### Resultado Esperado
- ✅ Pads mudam cor ao clicar
- ✅ Estados são independentes (pad 1 não afeta pad 2)
- ✅ Notas MIDI enviadas: 0x48 + offset (A4 a C5)

```
Pad 1 -> 0x48 (72)
Pad 2 -> 0x49 (73)
...
Pad 8 -> 0x4F (79)
```

## 🔊 Teste 5: Audio Controls (Fade In/Out)

### Objetivo
Validar controle de volume via Control Change.

### Passos
1. Música em reprodução
2. Clicar **FADE IN** (🔊)
   - Volume deve aumentar
3. Clicar **FADE OUT** (🔇)
   - Volume deve diminuir

### Resultado Esperado
- ✅ Volume aumenta/diminui suavemente
- ✅ MIDI CC 7 (Volume) enviado com valores 0x7F (max) ou 0x00 (min)

## ⚠️ Teste 6: Error Handling

### Objetivo
Validar tratamento de erros e desconexões.

### Passos
1. App conectado normalmente
2. Desligar iPad ou Wi-Fi do iPad
3. Tentar clicar num botão
4. Verificar mensagem de erro exibida
5. Reconectar iPad
6. App deve reconectar automaticamente

### Resultado Esperado
- ✅ Mensagem de erro clara: "Not connected to Playback"
- ✅ Botões ficam desabilitados
- ✅ Conexão é retentada automaticamente

## 🔍 Monitoramento e Debug

### Console Logs
Procurar pelos logs estruturados:
```
[RTP-MIDI] Attempting to connect to 192.168.1.100:5004
[RTP-MIDI] Initiating handshake on port 5004
[RTP-MIDI] Connected successfully
[RTP-MIDI] Sending MIDI Note On: note=60, velocity=127
```

### Browser DevTools
1. Abrir Chrome DevTools (F12)
2. Ir para **Console**
3. Filtrar por `[RTP-MIDI]`
4. Ver histórico de operações

### Network Inspection
Para futura integração com UDP real:
```bash
tcpdump -i en0 -n udp port 5004 or udp port 5005
```

## 📊 Checklist Final

- [ ] Handshake AppleMIDI com sucesso (porta 5004 e 5005)
- [ ] Play/Pause funcionam
- [ ] Loop Section funciona
- [ ] Repeat funciona
- [ ] Loop Infinito funciona
- [ ] Todos os 8 pads funcionam
- [ ] Fade In aumenta volume
- [ ] Fade Out diminui volume
- [ ] Erros são tratados gracefully
- [ ] Keep-alive mantém conexão ativa (5+ minutos)
- [ ] Sem crashes ou erros de memória

## 🐛 Problemas Comuns

### "Velocity cannot be 0"
**Problema:** Algum comando está enviando velocity = 0

**Solução:** Verificar que todos os comandos usam velocity = 0x7F (127)

Código correto:
```typescript
this.rtpMidiService.sendNoteOn(0x3c, 0x7f) // ✅ Correto
this.rtpMidiService.sendNoteOn(0x3c, 0x00) // ❌ Errado
```

### Conexão cai após 30 segundos
**Problema:** Keep-alive não está funcionando

**Solução:** Verificar que `startKeepAlive()` é chamado após handshake bem-sucedido

### Notas não são ouvidas no iPad
**Problema:** Notas estão sendo enviadas mas Playback não as processa

**Checklist:**
1. Velocity > 0? (Playback ignora velocity = 0)
2. Notas estão no range correto? (0x3C-0x4F)
3. MIDI está ativado no Playback?
4. Network Session está "Listening" no iPad?

## 📱 Teste em Device Real

Para testar em Android device real (não emulador):
1. Instalar via APK ou play store
2. Garantir que device Android e iPad estão no mesmo Wi-Fi
3. Seguir mesmos testes acima

**Nota:** Emulador Android pode ter dificuldades com networking local.

## 🎯 Próximas Fases

Após validar Fase 1 (Play/Pause):

### Fase 2: Telemetria via OSC
- Receber metadados do Playback (track name, tempo, seção)
- Exibir estado atual na UI

### Fase 3: Discovery
- Implementar mDNS/Bonjour para encontrar iPad automaticamente
- Remover necessidade de IP estático

### Fase 4: Advanced Features
- Programação de setlist
- Sincronização de pads com musical arrangements
- Feedback visual em tempo real
