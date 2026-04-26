type AdditionalData = Record<string, unknown>;

type CreateResponseOptions<T extends AdditionalData = Record<string, never>> = {
    message: string;
    ok?: boolean;
    status?: number;
    additionalData?: T;
};

export type CreateResponseType<T extends AdditionalData = Record<string, never>> = {
    message: string;
    ok: boolean;
} & T;

export function CreateResponse<T extends AdditionalData = Record<string, never>>({
    message,
    ok = false,
    status = 400,
    additionalData,
}: CreateResponseOptions<T>) {
    return Response.json(
        { message, ok, ...(additionalData ?? ({} as T)) },
        { status },
    );
}