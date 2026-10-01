#!/usr/bin/env python3
"""
FlowCreator OS - Bulk Audio Uploader for Cloudflare R2 & Neon PostgreSQL
Uploads a folder of .mp3/.wav files to Cloudflare R2 and outputs ready-to-run SQL INSERT statements.

Usage:
    python bulk_upload_r2.py --folder "C:/path/to/my_songs" --category "Sad & Shayari"
"""

import os
import sys
import argparse
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Upload audio files to Cloudflare R2")
    parser.add_argument("--folder", type=str, required=True, help="Folder containing .mp3 or .wav files")
    parser.add_argument("--category", type=str, default="Trending", help="Category name (e.g. 'Sad & Shayari', 'Phonk', 'Podcast')")
    parser.add_argument("--artist", type=str, default="Creator Vault", help="Artist name")
    args = parser.parse_args()

    audio_dir = Path(args.folder)
    if not audio_dir.exists():
        print(f"Error: Folder '{args.folder}' does not exist.")
        sys.exit(1)

    r2_public_url = os.getenv("CLOUDFLARE_R2_PUBLIC_URL", "https://pub-your-id.r2.dev").rstrip("/")
    account_id = os.getenv("R2_ACCOUNT_ID")
    access_key = os.getenv("R2_ACCESS_KEY_ID")
    secret_key = os.getenv("R2_SECRET_ACCESS_KEY")
    bucket_name = os.getenv("R2_BUCKET_NAME", "flowcreator-music")

    s3_client = None
    if account_id and access_key and secret_key:
        try:
            import boto3
            endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"
            s3_client = boto3.client(
                "s3",
                endpoint_url=endpoint_url,
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                region_name="auto"
            )
            print("[✓] Connected to Cloudflare R2 S3 API")
        except ImportError:
            print("[!] boto3 not installed. Run 'pip install boto3' for direct automated upload.")

    audio_files = list(audio_dir.glob("*.mp3")) + list(audio_dir.glob("*.wav"))
    print(f"Found {len(audio_files)} audio files in '{audio_dir}'. Processing...\n")

    sql_statements = []

    for f in audio_files:
        clean_name = f.stem.replace("_", " ").title()
        filename = f.name
        public_file_url = f"{r2_public_url}/bgm/{filename}"

        if s3_client:
            try:
                print(f"Uploading {filename} to R2...")
                s3_client.upload_file(
                    str(f),
                    bucket_name,
                    f"bgm/{filename}",
                    ExtraArgs={"ContentType": "audio/mpeg" if f.suffix == ".mp3" else "audio/wav"}
                )
                print(f"  [✓] Uploaded: {public_file_url}")
            except Exception as e:
                print(f"  [✗] Upload failed for {filename}: {e}")

        # Generate SQL
        tags = [t.lower() for t in clean_name.split() if len(t) > 2]
        tags_sql = "ARRAY[" + ", ".join([f"'{t}'" for t in tags]) + "]" if tags else "ARRAY['music']"
        sql = f"INSERT INTO bgm_tracks (title, artist, category, mood, tags, audio_url, duration_sec, play_count) VALUES ('{clean_name}', '{args.artist}', '{args.category}', 'Trending', {tags_sql}, '{public_file_url}', 180, 500);"
        sql_statements.append(sql)

    output_sql_path = Path("generated_tracks.sql")
    with open(output_sql_path, "w", encoding="utf-8") as out:
        out.write("\n".join(sql_statements) + "\n")

    print(f"\n[✓] Done! Generated SQL file saved to '{output_sql_path}'.")
    print("You can copy the contents of 'generated_tracks.sql' directly into the Neon Console SQL Editor!")

if __name__ == "__main__":
    main()
