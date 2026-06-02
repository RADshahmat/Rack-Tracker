export interface Rack {
    id: number;
    tag: string;
    name: string;
    location: string | null;
    capacity: number;
    created_at: Date;
    updated_at: Date;
}

export interface RackAttachment {
    id: number;
    rack_id: number;
    filename: string;           
    original_name: string;      
    file_path: string;
    file_size: number;
    uploaded_by: number | null;
    created_at: Date;
}

export interface CreateRackInput {
    tag: string;
    name: string;
    location?: string;
    capacity?: number;
}

export interface UpdateRackInput {
    tag?: string;
    name?: string;
    location?: string;
    capacity?: number;
}

export interface CreateAttachmentInput {
    rack_id: number;
    filename: string;
    original_name: string;
    file_path: string;
    file_size: number;
    uploaded_by: number;
}