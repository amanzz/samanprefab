import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attributeService, type ProductAttribute, type CreateAttributePayload } from '@/services/attribute.service';

const ATTRIBUTES_KEY = 'attributes';

const invalidateAll = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: [ATTRIBUTES_KEY] });
};

export function useAttributes(params?: Record<string, any>) {
  return useQuery({
    queryKey: [ATTRIBUTES_KEY, params],
    queryFn: () => attributeService.getAll(params),
  });
}

export function useActiveAttributes() {
  return useQuery({
    queryKey: [ATTRIBUTES_KEY, { isActive: true }],
    queryFn: () => attributeService.getAll({ isActive: true }),
  });
}

export function useCreateAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAttributePayload) => attributeService.create(data),
    onSuccess: () => {
      invalidateAll(qc);
    },
  });
}

export function useUpdateAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAttributePayload> }) =>
      attributeService.update(id, data),
    onSuccess: () => {
      invalidateAll(qc);
    },
  });
}

export function useDeleteAttribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attributeService.delete(id),
    onSuccess: () => {
      invalidateAll(qc);
    },
  });
}

export function useCreateAttributeValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attributeId, value, sortOrder }: { attributeId: string; value: string; sortOrder?: number }) =>
      attributeService.createValue(attributeId, { value, sortOrder }),
    onSuccess: () => {
      invalidateAll(qc);
    },
  });
}

export function useUpdateAttributeValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attributeId, valueId, data }: { attributeId: string; valueId: string; data: { value?: string; sortOrder?: number } }) =>
      attributeService.updateValue(attributeId, valueId, data),
    onSuccess: () => {
      invalidateAll(qc);
    },
  });
}

export function useDeleteAttributeValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attributeId, valueId }: { attributeId: string; valueId: string }) =>
      attributeService.deleteValue(attributeId, valueId),
    onSuccess: () => {
      invalidateAll(qc);
    },
  });
}
