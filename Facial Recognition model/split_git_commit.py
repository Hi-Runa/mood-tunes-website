import os
import subprocess
import time

def get_file_size(file_path):
    try:
        return os.path.getsize(file_path) / (1024 * 1024)  # File size in MB
    except OSError as e:
        print(f"Error accessing file {file_path}: {e}")
        return 0

def get_all_untracked_and_modified_files(repo_path):
    """Gets untracked and modified files, including files in subdirectories."""
    result = subprocess.run(["git", "status", "--porcelain"], stdout=subprocess.PIPE, text=True, cwd=repo_path)
    files = []
    for line in result.stdout.splitlines():
        # Handle both untracked (??) and modified ( M) files
        if not line.startswith("D "):  # Skip deleted files
            file_path = os.path.join(repo_path, line[3:].strip())
            if os.path.isdir(file_path):
                for root, dirs, filenames in os.walk(file_path):
                    for filename in filenames:
                        full_file_path = os.path.join(root, filename)
                        if os.path.isfile(full_file_path):  # Ensure it's a file
                            files.append(full_file_path)
            elif os.path.isfile(file_path):  # If it's a file, just add it
                files.append(file_path)
    return files

def stage_and_commit_in_chunks(repo_path, max_chunk_size=100):
    os.chdir(repo_path)

    while True:
        files = get_all_untracked_and_modified_files(repo_path)
        if not files:
            print("All files committed.")
            break

        current_chunk = []
        current_chunk_size = 0

        for file in files:
            file_size = get_file_size(file)
            if file_size == 0:
                continue

            if current_chunk_size + file_size > max_chunk_size:
                break  # Stop adding to this chunk

            current_chunk.append(file)
            current_chunk_size += file_size

        if current_chunk:
            print(f"Staging and committing {len(current_chunk)} files...")
            subprocess.run(["git", "add"] + current_chunk)
            subprocess.run(["git", "commit", "-m", f"Committing {len(current_chunk)} files under {max_chunk_size} MB"])
            subprocess.run(["git", "push"])
        else:
            print("No valid files to commit in this iteration.")
            break

        # Short delay to ensure Git has time to process
        time.sleep(1)

if __name__ == "__main__":
    repo_path = "."  # Path to your repository
    stage_and_commit_in_chunks(repo_path, max_chunk_size=100)
