export interface Warning {
    id: number;
    rack_id: number;
    rack_tag: string;
    message: string;
    resolved: boolean;
    emailed: boolean;
    created_at: Date;
}

export interface CreateWarningInput {
    rack_id: number;
    rack_tag: string;
    message: string;
}

export interface EmptyRack {
    id: number;
    tag: string;
    name: string;
    location: string | null;
}