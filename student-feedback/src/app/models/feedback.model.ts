export interface Feedback {
  _id?: string;
  studentName: string;
  studentId: string;
  course: string;
  teacherName: string;
  rating: number;
  comments: string;
  suggestions: string;
  createdAt?: string;
}
