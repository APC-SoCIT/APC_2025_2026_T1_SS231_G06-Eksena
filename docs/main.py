"""This is not final as there are issues with the training set"""

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
import numpy as np
import pandas as pd
import os
import cv2  

NUM_FRAMES = 16  
IMG_SIZE = (112, 112)
BATCH_SIZE = 4
class EmergencyVideoDataset(Dataset):
    """
    A custom PyTorch Dataset for loading and preprocessing emergency videos.
    """
    def __init__(self, metadata_file, video_dir, transform=None):
        """
        Args:
            metadata_file (str): Path to the CSV file with video names and labels.
            video_dir (str): Directory with all the video files (.mp4, .avi, etc.).
            transform (callable, optional): Optional transform to be applied on a sample.
        """
        self.metadata = pd.read_csv(metadata_file)
        self.video_dir = video_dir
        self.transform = transform

    def __len__(self):
        return len(self.metadata)

    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = idx.tolist()

        
        video_info = self.metadata.iloc[idx]
        video_name = video_info['filename']
        label_str = video_info['emergency_type']
        
        
        label_map = {'Fire': 0, 'Police': 1, 'Medical': 2}
        label = label_map[label_str]

        video_path = os.path.join(self.video_dir, video_name)


        frames = self._load_video(video_path, NUM_FRAMES) 

        
        if self.transform:
            frames = self.transform(frames)
        
        
        frames = frames.permute(3, 0, 1, 2) 
        
        return frames, label

    def _load_video(self, video_path, num_frames):
        """
        Reads a video and extracts a fixed number of evenly spaced frames.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Error opening video file: {video_path}")
            return np.zeros((num_frames, IMG_SIZE[0], IMG_SIZE[1], 3), dtype=np.float32)

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        
        indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
        
        video_frames = []
        
        for i in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, i)
            ret, frame = cap.read()
            if ret:
                
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) 
                
                frame = cv2.resize(frame, IMG_SIZE) 
                video_frames.append(frame)
            else:
                
                video_frames.append(np.zeros((*IMG_SIZE, 3), dtype=np.uint8))
        
        cap.release()
        return np.array(video_frames, dtype=np.float32)
    
    
   
class NormalizeVideo(object):
    """Normalize the frames and convert numpy array to PyTorch tensor."""
    def __call__(self, frames):
        
        frames = frames / 255.0
        
        return torch.from_numpy(frames).float()


video_transform = NormalizeVideo()


METADATA_CSV = 'training_metadata.csv' 
VIDEO_FILES_DIR = 'emergency_videos/train'


train_dataset = EmergencyVideoDataset(
    metadata_file=METADATA_CSV,
    video_dir=VIDEO_FILES_DIR,
    transform=video_transform
)


train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True, 
    num_workers=4 
)



print(f"\n--- Data Analysis Sample ---")
print(f"Total videos in training set: {len(train_dataset)}")


for i, (videos, labels) in enumerate(train_loader):
    print(f"\nBatch {i+1} loaded.")
    
    
    print(f"Videos tensor shape: {videos.shape}") 
    print(f"Labels tensor shape: {labels.shape}") 
    

    unique_labels, counts = torch.unique(labels, return_counts=True)
    print(f"Labels in batch: {unique_labels.tolist()} -> Counts: {counts.tolist()}")
    

    if i == 2:
        break

print("\n--- Data Loading and Analysis Complete ---")