export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type: "pdf" | "docx" | "txt";
  file_size_kb?: number;
  extracted_text?: string;
  word_count?: number;
  page_count?: number;
  created_at: string;
  updated_at: string;
}

export interface JobDescription {
  id: string;
  user_id: string;
  job_title: string;
  company_name?: string;
  description_text: string;
  role_category?: string;
  created_at: string;
}
