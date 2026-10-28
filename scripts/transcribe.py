#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
VozIA Studio - Script CLI de Transcrição em Lote de MP3 com Groq Whisper Large V3
Fidelidade Verbatim em Português do Brasil (PT-BR) - Sem Censura

Uso:
    python scripts/transcribe.py
    python scripts/transcribe.py audio1.mp3 audio2.mp3
"""

import os
import sys
import glob
import time
from datetime import datetime

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Chaves com failover automático
_configured_keys = os.environ.get("GROQ_API_KEYS", os.environ.get("GROQ_API_KEY", ""))
API_KEYS = [
    {"id": index + 1, "name": f"Configured key {index + 1}", "key": key.strip()}
    for index, key in enumerate(_configured_keys.split(",")) if key.strip()
]
if not API_KEYS:
    raise SystemExit("Set GROQ_API_KEY before running transcription. No provider credentials are bundled.")

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/audio/transcriptions"
MODEL = "whisper-large-v3"
LANGUAGE = "pt"
TEMPERATURE = 0
RESPONSE_FORMAT = "verbose_json"

SYSTEM_PROMPT = (
    "Transcrição verbatim e literal em português do Brasil (PT-BR). "
    "Capture exatamente cada palavra dita, incluindo gírias brasileiras, termos informais, "
    "expressões coloquiais, vícios de linguagem e palavrões, sem censura, sem omissões e sem suavização."
)

current_key_index = 0


def get_current_key():
    return API_KEYS[current_key_index]


def switch_key(reason="Rate limit ou erro de cota"):
    global current_key_index
    prev_key = get_current_key()
    current_key_index = (current_key_index + 1) % len(API_KEYS)
    new_key = get_current_key()
    print(f"\n[AVISO] Alternando chave ({reason}):")
    print(f"        {prev_key['name']} -> {new_key['name']}\n")
    return new_key


def format_bytes(num_bytes):
    for unit in ["B", "KB", "MB", "GB"]:
        if num_bytes < 1024.0:
            return f"{num_bytes:.2f} {unit}"
        num_bytes /= 1024.0
    return f"{num_bytes:.2f} TB"


def format_seconds(seconds):
    if not seconds:
        return "N/D"
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"


def transcribe_single_mp3(file_path):
    filename = os.path.basename(file_path)
    file_size = os.path.getsize(file_path)
    attempts = 0
    max_attempts = len(API_KEYS)

    try:
        from groq import Groq
        use_groq_sdk = True
    except ImportError:
        use_groq_sdk = False

    while attempts < max_attempts:
        active_key_info = get_current_key()
        api_key = active_key_info["key"]

        print(f" -> Transcrevendo '{filename}' ({format_bytes(file_size)}) via {active_key_info['name']}...")
        start_t = time.time()

        if use_groq_sdk:
            try:
                client = Groq(api_key=api_key)
                with open(file_path, "rb") as f:
                    transcription = client.audio.transcriptions.create(
                        file=(filename, f.read()),
                        model=MODEL,
                        language=LANGUAGE,
                        prompt=SYSTEM_PROMPT,
                        temperature=TEMPERATURE,
                        response_format=RESPONSE_FORMAT,
                    )

                elapsed = time.time() - start_t
                if hasattr(transcription, "model_dump"):
                    data = transcription.model_dump()
                elif hasattr(transcription, "to_dict"):
                    data = transcription.to_dict()
                else:
                    data = {
                        "text": getattr(transcription, "text", str(transcription)),
                        "duration": getattr(transcription, "duration", None),
                        "segments": getattr(transcription, "segments", []),
                    }

                return {
                    "filename": filename,
                    "filepath": file_path,
                    "filesize": file_size,
                    "duration": data.get("duration"),
                    "text": (data.get("text") or "").strip(),
                    "segments": data.get("segments", []),
                    "elapsed": elapsed,
                    "key_used": active_key_info["name"],
                    "status": "success",
                }

            except Exception as e:
                err_str = str(e)
                print(f"    [X] Erro com {active_key_info['name']}: {err_str}")
                if "429" in err_str or "rate" in err_str.lower() or "limit" in err_str.lower():
                    switch_key("Rate Limit 429 atingido")
                    attempts += 1
                    continue
                elif attempts + 1 < max_attempts:
                    switch_key(f"Falha na requisição: {err_str}")
                    attempts += 1
                    continue
                else:
                    return {
                        "filename": filename,
                        "filepath": file_path,
                        "filesize": file_size,
                        "duration": None,
                        "text": f"[ERRO NA TRANSCRIÇÃO]: {err_str}",
                        "segments": [],
                        "elapsed": time.time() - start_t,
                        "key_used": active_key_info["name"],
                        "status": "error",
                    }
        else:
            try:
                import requests
                headers = {"Authorization": f"Bearer {api_key}"}
                with open(file_path, "rb") as f:
                    files = {"file": (filename, f, "audio/mpeg")}
                    data = {
                        "model": MODEL,
                        "language": LANGUAGE,
                        "prompt": SYSTEM_PROMPT,
                        "temperature": str(TEMPERATURE),
                        "response_format": RESPONSE_FORMAT,
                    }
                    resp = requests.post(GROQ_ENDPOINT, headers=headers, files=files, data=data, timeout=300)

                if resp.status_code == 429 or resp.status_code in (401, 403):
                    switch_key(f"HTTP {resp.status_code} - Rate Limit / Autenticação")
                    attempts += 1
                    continue

                resp.raise_for_status()
                res_data = resp.json()
                elapsed = time.time() - start_t

                return {
                    "filename": filename,
                    "filepath": file_path,
                    "filesize": file_size,
                    "duration": res_data.get("duration"),
                    "text": (res_data.get("text") or "").strip(),
                    "segments": res_data.get("segments", []),
                    "elapsed": elapsed,
                    "key_used": active_key_info["name"],
                    "status": "success",
                }
            except Exception as e:
                err_str = str(e)
                print(f"    [X] Erro na requisição HTTP: {err_str}")
                if attempts + 1 < max_attempts:
                    switch_key(err_str)
                    attempts += 1
                    continue
                else:
                    return {
                        "filename": filename,
                        "filepath": file_path,
                        "filesize": file_size,
                        "duration": None,
                        "text": f"[ERRO]: {err_str}",
                        "segments": [],
                        "elapsed": time.time() - start_t,
                        "key_used": active_key_info["name"],
                        "status": "error",
                    }

    return {
        "filename": filename,
        "filepath": file_path,
        "filesize": file_size,
        "duration": None,
        "text": "[ERRO]: Não foi possível transcrever após tentar todas as chaves de API.",
        "segments": [],
        "elapsed": 0,
        "key_used": "Nenhuma",
        "status": "error",
    }


def generate_consolidated_txt(results, output_path):
    now = datetime.now()
    date_str = now.strftime("%d/%m/%Y às %H:%M:%S")

    lines = []
    lines.append("=" * 80)
    lines.append("             VOZIA STUDIO - TRANSCRIÇÕES CONSOLIDADAS")
    lines.append("=" * 80)
    lines.append(f"Data de Criação    : {date_str}")
    lines.append(f"Total de Áudios    : {len(results)} arquivo(s)")
    lines.append(f"Motor de IA        : Groq LPU ({MODEL})")
    lines.append(f"Idioma / Modo      : Português do Brasil (PT-BR) | Verbatim Sem Censura")
    lines.append("=" * 80 + "\n")

    total_words = 0
    total_duration = 0.0

    for idx, item in enumerate(results, 1):
        filename = item["filename"]
        size_str = format_bytes(item["filesize"])
        duration_str = format_seconds(item["duration"])
        words = len(item["text"].split()) if item["text"] else 0
        total_words += words
        if item.get("duration"):
            total_duration += float(item["duration"])

        lines.append("-" * 80)
        lines.append(f"[ÁUDIO {idx}/{len(results)}] - REFERÊNCIA: {filename}")
        lines.append("-" * 80)
        lines.append(f"• Arquivo Original : {filename}")
        lines.append(f"• Tamanho do Áudio : {size_str}")
        lines.append(f"• Duração Estimada : {duration_str}")
        lines.append(f"• Chave Utilizada  : {item['key_used']}")
        lines.append(f"• Tempo de Process : {item['elapsed']:.2f} segundos")
        lines.append(f"• Total de Palavras: {words}")
        lines.append("\n--- [TRANSCRIÇÃO VERBATIM COMPLETA (SEM CENSURA)] ---\n")
        lines.append(item["text"] if item["text"] else "[Nenhum áudio detectado]")
        lines.append("\n")

        segments = item.get("segments", [])
        if segments:
            lines.append("--- [DETALHAMENTO POR SEGMENTOS DE TEMPO] ---")
            for seg in segments:
                if isinstance(seg, dict):
                    start = format_seconds(seg.get("start", 0))
                    end = format_seconds(seg.get("end", 0))
                    seg_text = (seg.get("text") or "").strip()
                    lines.append(f"[{start} -> {end}] {seg_text}")
            lines.append("\n")

        lines.append("\n")

    lines.append("=" * 80)
    lines.append("                               RESUMO FINAL")
    lines.append("=" * 80)
    lines.append(f"• Arquivos Processados: {len(results)}")
    lines.append(f"• Tempo Total de Áudio: {format_seconds(total_duration)}")
    lines.append(f"• Total de Palavras   : {total_words}")
    lines.append("• Fidelidade          : 100% Verbatim (Gírias, palavrões e coloquialismos preservados)")
    lines.append("=" * 80 + "\n")

    content = "\n".join(lines)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    return output_path


def main():
    print("=" * 70)
    print("  VOZIA STUDIO - Transcritor de Lotes (Groq Whisper Large V3)")
    print("  100% Verbatim PT-BR (Sem censura para gírias e termos coloquiais)")
    print("=" * 70)

    mp3_files = []
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            if os.path.isfile(arg):
                mp3_files.append(os.path.abspath(arg))
            elif os.path.isdir(arg):
                found = glob.glob(os.path.join(arg, "*.mp3"))
                mp3_files.extend([os.path.abspath(f) for f in found])
    else:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        found = glob.glob(os.path.join(current_dir, "*.mp3"))
        if not found:
            found = glob.glob(os.path.join(os.path.dirname(current_dir), "*.mp3"))
        mp3_files.extend(found)

    mp3_files = list(dict.fromkeys(mp3_files))

    if not mp3_files:
        print("\n[!] Nenhum arquivo de áudio encontrado para transcrição.")
        print("    Passe os arquivos como argumento:")
        print("    python scripts/transcribe.py audio1.mp3 audio2.mp3\n")
        return

    if len(mp3_files) > 10:
        print(f"\n[i] Foram detectados {len(mp3_files)} arquivos. Limitando aos primeiros 10:")
        mp3_files = mp3_files[:10]

    print(f"\n[+] {len(mp3_files)} arquivo(s) identificado(s):")
    for i, path in enumerate(mp3_files, 1):
        print(f"    {i}. {os.path.basename(path)} ({format_bytes(os.path.getsize(path))})")

    results = []
    for i, file_path in enumerate(mp3_files, 1):
        print(f"\n[{i}/{len(mp3_files)}] Processando:")
        res = transcribe_single_mp3(file_path)
        results.append(res)
        if res["status"] == "success":
            print(f"    -> Concluído em {res['elapsed']:.2f}s ({len(res['text'])} caracteres)")
        else:
            print(f"    -> Falhou: {res['text']}")

    now_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"transcricoes_consolidadas_{now_str}.txt"
    output_path = os.path.join(os.getcwd(), output_filename)

    generate_consolidated_txt(results, output_path)

    print("\n" + "=" * 70)
    print("  PROCESSO CONCLUÍDO COM SUCESSO!")
    print(f"  Arquivo consolidado salvo em:")
    print(f"  -> {output_path}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
