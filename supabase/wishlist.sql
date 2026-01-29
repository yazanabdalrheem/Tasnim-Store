-- Create wishlist table
CREATE TABLE public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own wishlist items" 
    ON public.wishlist FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add items to their wishlist" 
    ON public.wishlist FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove items from their wishlist" 
    ON public.wishlist FOR DELETE 
    USING (auth.uid() = user_id);
