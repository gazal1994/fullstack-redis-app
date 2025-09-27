export interface Task {
  id: string; // Changed from number to string to match MongoDB ObjectId
  title: string;
  description?: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}
