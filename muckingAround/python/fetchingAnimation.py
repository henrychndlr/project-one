import time
import sys
import threading

stopWriting = False

def animate_fetching():
    global stopWriting
    message = "Fetching details"
    dots = ""
    increasing = True
    
    while not stopWriting:
        sys.stdout.write(f"\r{message}{dots}{' ' * (3 - len(dots))}")
        sys.stdout.flush()
        
        if increasing:
            dots += "."
            if len(dots) == 3:
                increasing = False
        else:
            dots = dots[:-1]
            if len(dots) == 0:
                increasing = True
        
        time.sleep(1)
    
    sys.stdout.write("\r" + " " * len(message) + "\r")
    sys.stdout.flush()

def fetch_data():
    global stopWriting
    time.sleep(6)  # Replace this with actual data fetching code
    stopWriting = True

def main():
    animation_thread = threading.Thread(target=animate_fetching)
    animation_thread.start()
    fetch_data()
    animation_thread.join()

if __name__ == "__main__":
    main()
