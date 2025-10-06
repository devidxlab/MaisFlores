-- Create the flowers table if it doesn't exist
CREATE TABLE IF NOT EXISTS flowers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT
);

-- Insert initial data if the table is empty
INSERT INTO flowers (name, price)
SELECT * FROM (
    VALUES 
    ('Rosa Vermelha', 5.00),
    ('Orquídea', 15.00),
    ('Lírio', 8.00),
    ('Margarida', 3.50),
    ('Girassol', 6.00),
    ('Crisântemo', 4.50),
    ('Tulipa', 7.00),
    ('Azaleia', 12.00),
    ('Cravina', 4.00),
    ('Jasmim', 5.50)
) AS data(name, price)
WHERE NOT EXISTS (SELECT 1 FROM flowers LIMIT 1);

-- Add image_url column if it doesn't exist
ALTER TABLE flowers 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing records with flower images
UPDATE flowers
SET image_url = CASE name
    WHEN 'Azaleia' THEN 'https://http2.mlstatic.com/D_NQ_NP_2X_984617-MLB50208553371_062022-F.webp'
    WHEN 'Rosa Vermelha' THEN 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=800'
    WHEN 'Orquídea' THEN 'https://images.unsplash.com/photo-1566938064504-a379175168b3?w=800'
    WHEN 'Lírio' THEN 'https://images.unsplash.com/photo-1588626174995-a425969d4c3b?w=800'
    WHEN 'Margarida' THEN 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=800'
    WHEN 'Girassol' THEN 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800'
    WHEN 'Crisântemo' THEN 'https://images.unsplash.com/photo-1635341814021-064fe8e310a3?w=800'
    WHEN 'Tulipa' THEN 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800'
    WHEN 'Cravina' THEN 'https://images.unsplash.com/photo-1589994160839-163cd867cfe8?w=800'
    WHEN 'Jasmim' THEN 'https://images.unsplash.com/photo-1591710668263-bee1e9db2a26?w=800'
    ELSE 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800'
END
WHERE image_url IS NULL;