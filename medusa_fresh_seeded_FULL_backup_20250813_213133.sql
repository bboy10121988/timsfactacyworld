--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

-- Started on 2025-08-13 21:31:33 CST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1224 (class 1247 OID 163403)
-- Name: claim_reason_enum; Type: TYPE; Schema: public; Owner: raychou
--

CREATE TYPE public.claim_reason_enum AS ENUM (
    'missing_item',
    'wrong_item',
    'production_failure',
    'other'
);


ALTER TYPE public.claim_reason_enum OWNER TO raychou;

--
-- TOC entry 1218 (class 1247 OID 163382)
-- Name: order_claim_type_enum; Type: TYPE; Schema: public; Owner: raychou
--

CREATE TYPE public.order_claim_type_enum AS ENUM (
    'refund',
    'replace'
);


ALTER TYPE public.order_claim_type_enum OWNER TO raychou;

--
-- TOC entry 1164 (class 1247 OID 163048)
-- Name: order_status_enum; Type: TYPE; Schema: public; Owner: raychou
--

CREATE TYPE public.order_status_enum AS ENUM (
    'pending',
    'completed',
    'draft',
    'archived',
    'canceled',
    'requires_action'
);


ALTER TYPE public.order_status_enum OWNER TO raychou;

--
-- TOC entry 1233 (class 1247 OID 163453)
-- Name: return_status_enum; Type: TYPE; Schema: public; Owner: raychou
--

CREATE TYPE public.return_status_enum AS ENUM (
    'open',
    'requested',
    'received',
    'partially_received',
    'canceled'
);


ALTER TYPE public.return_status_enum OWNER TO raychou;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 275 (class 1259 OID 163000)
-- Name: account_holder; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.account_holder (
    id text NOT NULL,
    provider_id text NOT NULL,
    external_id text NOT NULL,
    email text,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.account_holder OWNER TO raychou;

--
-- TOC entry 346 (class 1259 OID 169704)
-- Name: affiliate_click; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.affiliate_click (
    id text NOT NULL,
    affiliate_code text NOT NULL,
    product_id text,
    ip_address text,
    user_agent text,
    referrer_url text,
    session_id text,
    converted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.affiliate_click OWNER TO raychou;

--
-- TOC entry 347 (class 1259 OID 169715)
-- Name: affiliate_conversion; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.affiliate_conversion (
    id text NOT NULL,
    affiliate_code text NOT NULL,
    order_id text NOT NULL,
    order_total numeric NOT NULL,
    commission_rate numeric NOT NULL,
    commission_amount numeric NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    click_id text,
    paid_at timestamp with time zone,
    payment_reference text,
    raw_order_total jsonb NOT NULL,
    raw_commission_rate jsonb NOT NULL,
    raw_commission_amount jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT affiliate_conversion_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'paid'::text])))
);


ALTER TABLE public.affiliate_conversion OWNER TO raychou;

--
-- TOC entry 345 (class 1259 OID 164157)
-- Name: affiliate_partner; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.affiliate_partner (
    id character varying NOT NULL,
    name character varying NOT NULL,
    partner_code character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying,
    commission_rate numeric(5,4) DEFAULT 0.1000 NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    rejection_reason text,
    approved_by character varying,
    approved_at timestamp with time zone,
    metadata jsonb,
    total_orders integer DEFAULT 0 NOT NULL,
    total_commission_earned numeric(12,2) DEFAULT 0 NOT NULL,
    total_commission_paid numeric(12,2) DEFAULT 0 NOT NULL,
    last_order_at timestamp with time zone,
    password_hash character varying,
    website character varying,
    affiliate_code character varying,
    referral_link character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    social_media text,
    address text,
    account_name character varying(255),
    bank_code character varying(10),
    account_number character varying(50),
    tax_id character varying(20),
    referred_by_code character varying,
    total_referrals integer DEFAULT 0,
    CONSTRAINT affiliate_partner_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'suspended'::character varying])::text[])))
);


ALTER TABLE public.affiliate_partner OWNER TO raychou;

--
-- TOC entry 5456 (class 0 OID 0)
-- Dependencies: 345
-- Name: COLUMN affiliate_partner.social_media; Type: COMMENT; Schema: public; Owner: raychou
--

COMMENT ON COLUMN public.affiliate_partner.social_media IS '社交媒體資訊 (Instagram, Facebook 等)';


--
-- TOC entry 5457 (class 0 OID 0)
-- Dependencies: 345
-- Name: COLUMN affiliate_partner.address; Type: COMMENT; Schema: public; Owner: raychou
--

COMMENT ON COLUMN public.affiliate_partner.address IS '聯絡地址';


--
-- TOC entry 5458 (class 0 OID 0)
-- Dependencies: 345
-- Name: COLUMN affiliate_partner.account_name; Type: COMMENT; Schema: public; Owner: raychou
--

COMMENT ON COLUMN public.affiliate_partner.account_name IS '銀行帳戶姓名';


--
-- TOC entry 5459 (class 0 OID 0)
-- Dependencies: 345
-- Name: COLUMN affiliate_partner.bank_code; Type: COMMENT; Schema: public; Owner: raychou
--

COMMENT ON COLUMN public.affiliate_partner.bank_code IS '銀行代碼';


--
-- TOC entry 5460 (class 0 OID 0)
-- Dependencies: 345
-- Name: COLUMN affiliate_partner.account_number; Type: COMMENT; Schema: public; Owner: raychou
--

COMMENT ON COLUMN public.affiliate_partner.account_number IS '銀行帳號';


--
-- TOC entry 5461 (class 0 OID 0)
-- Dependencies: 345
-- Name: COLUMN affiliate_partner.tax_id; Type: COMMENT; Schema: public; Owner: raychou
--

COMMENT ON COLUMN public.affiliate_partner.tax_id IS '統一編號或身分證字號';


--
-- TOC entry 259 (class 1259 OID 162723)
-- Name: api_key; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.api_key (
    id text NOT NULL,
    token text NOT NULL,
    salt text NOT NULL,
    redacted text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    last_used_at timestamp with time zone,
    created_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_by text,
    revoked_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT api_key_type_check CHECK ((type = ANY (ARRAY['publishable'::text, 'secret'::text])))
);


ALTER TABLE public.api_key OWNER TO raychou;

--
-- TOC entry 241 (class 1259 OID 162258)
-- Name: application_method_buy_rules; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.application_method_buy_rules (
    application_method_id text NOT NULL,
    promotion_rule_id text NOT NULL
);


ALTER TABLE public.application_method_buy_rules OWNER TO raychou;

--
-- TOC entry 240 (class 1259 OID 162251)
-- Name: application_method_target_rules; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.application_method_target_rules (
    application_method_id text NOT NULL,
    promotion_rule_id text NOT NULL
);


ALTER TABLE public.application_method_target_rules OWNER TO raychou;

--
-- TOC entry 304 (class 1259 OID 163510)
-- Name: auth_identity; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.auth_identity (
    id text NOT NULL,
    app_metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.auth_identity OWNER TO raychou;

--
-- TOC entry 273 (class 1259 OID 162916)
-- Name: capture; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.capture (
    id text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    payment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by text,
    metadata jsonb
);


ALTER TABLE public.capture OWNER TO raychou;

--
-- TOC entry 248 (class 1259 OID 162476)
-- Name: cart; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.cart (
    id text NOT NULL,
    region_id text,
    customer_id text,
    sales_channel_id text,
    email text,
    currency_code text NOT NULL,
    shipping_address_id text,
    billing_address_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    completed_at timestamp with time zone
);


ALTER TABLE public.cart OWNER TO raychou;

--
-- TOC entry 249 (class 1259 OID 162491)
-- Name: cart_address; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.cart_address (
    id text NOT NULL,
    customer_id text,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.cart_address OWNER TO raychou;

--
-- TOC entry 250 (class 1259 OID 162500)
-- Name: cart_line_item; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.cart_line_item (
    id text NOT NULL,
    cart_id text NOT NULL,
    title text NOT NULL,
    subtitle text,
    thumbnail text,
    quantity integer NOT NULL,
    variant_id text,
    product_id text,
    product_title text,
    product_description text,
    product_subtitle text,
    product_type text,
    product_collection text,
    product_handle text,
    variant_sku text,
    variant_barcode text,
    variant_title text,
    variant_option_values jsonb,
    requires_shipping boolean DEFAULT true NOT NULL,
    is_discountable boolean DEFAULT true NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    compare_at_unit_price numeric,
    raw_compare_at_unit_price jsonb,
    unit_price numeric NOT NULL,
    raw_unit_price jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    product_type_id text,
    is_custom_price boolean DEFAULT false NOT NULL,
    is_giftcard boolean DEFAULT false NOT NULL,
    CONSTRAINT cart_line_item_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


ALTER TABLE public.cart_line_item OWNER TO raychou;

--
-- TOC entry 251 (class 1259 OID 162526)
-- Name: cart_line_item_adjustment; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.cart_line_item_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    item_id text,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    CONSTRAINT cart_line_item_adjustment_check CHECK ((amount >= (0)::numeric))
);


ALTER TABLE public.cart_line_item_adjustment OWNER TO raychou;

--
-- TOC entry 252 (class 1259 OID 162538)
-- Name: cart_line_item_tax_line; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.cart_line_item_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate real NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    item_id text
);


ALTER TABLE public.cart_line_item_tax_line OWNER TO raychou;

--
-- TOC entry 341 (class 1259 OID 164033)
-- Name: cart_payment_collection; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.cart_payment_collection (
    cart_id character varying(255) NOT NULL,
    payment_collection_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.cart_payment_collection OWNER TO raychou;

--
-- TOC entry 328 (class 1259 OID 163878)
-- Name: cart_promotion; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.cart_promotion (
    cart_id character varying(255) NOT NULL,
    promotion_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.cart_promotion OWNER TO raychou;

--
-- TOC entry 253 (class 1259 OID 162549)
-- Name: cart_shipping_method; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.cart_shipping_method (
    id text NOT NULL,
    cart_id text NOT NULL,
    name text NOT NULL,
    description jsonb,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    shipping_option_id text,
    data jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT cart_shipping_method_check CHECK ((amount >= (0)::numeric))
);


ALTER TABLE public.cart_shipping_method OWNER TO raychou;

--
-- TOC entry 254 (class 1259 OID 162562)
-- Name: cart_shipping_method_adjustment; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.cart_shipping_method_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    shipping_method_id text
);


ALTER TABLE public.cart_shipping_method_adjustment OWNER TO raychou;

--
-- TOC entry 255 (class 1259 OID 162573)
-- Name: cart_shipping_method_tax_line; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.cart_shipping_method_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate real NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    shipping_method_id text
);


ALTER TABLE public.cart_shipping_method_tax_line OWNER TO raychou;

--
-- TOC entry 256 (class 1259 OID 162676)
-- Name: credit_line; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.credit_line (
    id text NOT NULL,
    cart_id text NOT NULL,
    reference text,
    reference_id text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.credit_line OWNER TO raychou;

--
-- TOC entry 266 (class 1259 OID 162841)
-- Name: currency; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.currency (
    code text NOT NULL,
    symbol text NOT NULL,
    symbol_native text NOT NULL,
    decimal_digits integer DEFAULT 0 NOT NULL,
    rounding numeric DEFAULT 0 NOT NULL,
    raw_rounding jsonb NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.currency OWNER TO raychou;

--
-- TOC entry 243 (class 1259 OID 162388)
-- Name: customer; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.customer (
    id text NOT NULL,
    company_name text,
    first_name text,
    last_name text,
    email text,
    phone text,
    has_account boolean DEFAULT false NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by text
);


ALTER TABLE public.customer OWNER TO raychou;

--
-- TOC entry 340 (class 1259 OID 164031)
-- Name: customer_account_holder; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.customer_account_holder (
    customer_id character varying(255) NOT NULL,
    account_holder_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_account_holder OWNER TO raychou;

--
-- TOC entry 244 (class 1259 OID 162398)
-- Name: customer_address; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.customer_address (
    id text NOT NULL,
    customer_id text NOT NULL,
    address_name text,
    is_default_shipping boolean DEFAULT false NOT NULL,
    is_default_billing boolean DEFAULT false NOT NULL,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_address OWNER TO raychou;

--
-- TOC entry 245 (class 1259 OID 162412)
-- Name: customer_group; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.customer_group (
    id text NOT NULL,
    name text NOT NULL,
    metadata jsonb,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_group OWNER TO raychou;

--
-- TOC entry 246 (class 1259 OID 162422)
-- Name: customer_group_customer; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.customer_group_customer (
    id text NOT NULL,
    customer_id text NOT NULL,
    customer_group_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_group_customer OWNER TO raychou;

--
-- TOC entry 317 (class 1259 OID 163674)
-- Name: fulfillment; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.fulfillment (
    id text NOT NULL,
    location_id text NOT NULL,
    packed_at timestamp with time zone,
    shipped_at timestamp with time zone,
    delivered_at timestamp with time zone,
    canceled_at timestamp with time zone,
    data jsonb,
    provider_id text,
    shipping_option_id text,
    metadata jsonb,
    delivery_address_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    marked_shipped_by text,
    created_by text,
    requires_shipping boolean DEFAULT true NOT NULL
);


ALTER TABLE public.fulfillment OWNER TO raychou;

--
-- TOC entry 308 (class 1259 OID 163566)
-- Name: fulfillment_address; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.fulfillment_address (
    id text NOT NULL,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_address OWNER TO raychou;

--
-- TOC entry 319 (class 1259 OID 163700)
-- Name: fulfillment_item; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.fulfillment_item (
    id text NOT NULL,
    title text NOT NULL,
    sku text NOT NULL,
    barcode text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    line_item_id text,
    inventory_item_id text,
    fulfillment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_item OWNER TO raychou;

--
-- TOC entry 318 (class 1259 OID 163689)
-- Name: fulfillment_label; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.fulfillment_label (
    id text NOT NULL,
    tracking_number text NOT NULL,
    tracking_url text NOT NULL,
    label_url text NOT NULL,
    fulfillment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_label OWNER TO raychou;

--
-- TOC entry 309 (class 1259 OID 163576)
-- Name: fulfillment_provider; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.fulfillment_provider (
    id text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_provider OWNER TO raychou;

--
-- TOC entry 310 (class 1259 OID 163584)
-- Name: fulfillment_set; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.fulfillment_set (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_set OWNER TO raychou;

--
-- TOC entry 312 (class 1259 OID 163607)
-- Name: geo_zone; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.geo_zone (
    id text NOT NULL,
    type text DEFAULT 'country'::text NOT NULL,
    country_code text NOT NULL,
    province_code text,
    city text,
    service_zone_id text NOT NULL,
    postal_expression jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT geo_zone_type_check CHECK ((type = ANY (ARRAY['country'::text, 'province'::text, 'city'::text, 'zip'::text])))
);


ALTER TABLE public.geo_zone OWNER TO raychou;

--
-- TOC entry 220 (class 1259 OID 161685)
-- Name: image; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.image (
    id text NOT NULL,
    url text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    rank integer DEFAULT 0 NOT NULL,
    product_id text NOT NULL
);


ALTER TABLE public.image OWNER TO raychou;

--
-- TOC entry 213 (class 1259 OID 161526)
-- Name: inventory_item; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.inventory_item (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    sku text,
    origin_country text,
    hs_code text,
    mid_code text,
    material text,
    weight integer,
    length integer,
    height integer,
    width integer,
    requires_shipping boolean DEFAULT true NOT NULL,
    description text,
    title text,
    thumbnail text,
    metadata jsonb
);


ALTER TABLE public.inventory_item OWNER TO raychou;

--
-- TOC entry 214 (class 1259 OID 161538)
-- Name: inventory_level; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.inventory_level (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    inventory_item_id text NOT NULL,
    location_id text NOT NULL,
    stocked_quantity numeric DEFAULT 0 NOT NULL,
    reserved_quantity numeric DEFAULT 0 NOT NULL,
    incoming_quantity numeric DEFAULT 0 NOT NULL,
    metadata jsonb,
    raw_stocked_quantity jsonb,
    raw_reserved_quantity jsonb,
    raw_incoming_quantity jsonb
);


ALTER TABLE public.inventory_level OWNER TO raychou;

--
-- TOC entry 306 (class 1259 OID 163539)
-- Name: invite; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.invite (
    id text NOT NULL,
    email text NOT NULL,
    accepted boolean DEFAULT false NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.invite OWNER TO raychou;

--
-- TOC entry 324 (class 1259 OID 163857)
-- Name: link_module_migrations; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.link_module_migrations (
    id integer NOT NULL,
    table_name character varying(255) NOT NULL,
    link_descriptor jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.link_module_migrations OWNER TO raychou;

--
-- TOC entry 323 (class 1259 OID 163856)
-- Name: link_module_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: raychou
--

CREATE SEQUENCE public.link_module_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.link_module_migrations_id_seq OWNER TO raychou;

--
-- TOC entry 5462 (class 0 OID 0)
-- Dependencies: 323
-- Name: link_module_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raychou
--

ALTER SEQUENCE public.link_module_migrations_id_seq OWNED BY public.link_module_migrations.id;


--
-- TOC entry 327 (class 1259 OID 163875)
-- Name: location_fulfillment_provider; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.location_fulfillment_provider (
    stock_location_id character varying(255) NOT NULL,
    fulfillment_provider_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.location_fulfillment_provider OWNER TO raychou;

--
-- TOC entry 325 (class 1259 OID 163869)
-- Name: location_fulfillment_set; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.location_fulfillment_set (
    stock_location_id character varying(255) NOT NULL,
    fulfillment_set_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.location_fulfillment_set OWNER TO raychou;

--
-- TOC entry 210 (class 1259 OID 161485)
-- Name: mikro_orm_migrations; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.mikro_orm_migrations (
    id integer NOT NULL,
    name character varying(255),
    executed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.mikro_orm_migrations OWNER TO raychou;

--
-- TOC entry 209 (class 1259 OID 161484)
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: raychou
--

CREATE SEQUENCE public.mikro_orm_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mikro_orm_migrations_id_seq OWNER TO raychou;

--
-- TOC entry 5463 (class 0 OID 0)
-- Dependencies: 209
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raychou
--

ALTER SEQUENCE public.mikro_orm_migrations_id_seq OWNED BY public.mikro_orm_migrations.id;


--
-- TOC entry 321 (class 1259 OID 163809)
-- Name: notification; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.notification (
    id text NOT NULL,
    "to" text NOT NULL,
    channel text NOT NULL,
    template text NOT NULL,
    data jsonb,
    trigger_type text,
    resource_id text,
    resource_type text,
    receiver_id text,
    original_notification_id text,
    idempotency_key text,
    external_id text,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    CONSTRAINT notification_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'success'::text, 'failure'::text])))
);


ALTER TABLE public.notification OWNER TO raychou;

--
-- TOC entry 320 (class 1259 OID 163801)
-- Name: notification_provider; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.notification_provider (
    id text NOT NULL,
    handle text NOT NULL,
    name text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    channels text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.notification_provider OWNER TO raychou;

--
-- TOC entry 278 (class 1259 OID 163035)
-- Name: order; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public."order" (
    id text NOT NULL,
    region_id text,
    display_id integer,
    customer_id text,
    version integer DEFAULT 1 NOT NULL,
    sales_channel_id text,
    status public.order_status_enum DEFAULT 'pending'::public.order_status_enum NOT NULL,
    is_draft_order boolean DEFAULT false NOT NULL,
    email text,
    currency_code text NOT NULL,
    shipping_address_id text,
    billing_address_id text,
    no_notification boolean,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    canceled_at timestamp with time zone
);


ALTER TABLE public."order" OWNER TO raychou;

--
-- TOC entry 276 (class 1259 OID 163024)
-- Name: order_address; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_address (
    id text NOT NULL,
    customer_id text,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_address OWNER TO raychou;

--
-- TOC entry 326 (class 1259 OID 163872)
-- Name: order_cart; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_cart (
    order_id character varying(255) NOT NULL,
    cart_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_cart OWNER TO raychou;

--
-- TOC entry 280 (class 1259 OID 163087)
-- Name: order_change; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_change (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    internal_note text,
    created_by text,
    requested_by text,
    requested_at timestamp with time zone,
    confirmed_by text,
    confirmed_at timestamp with time zone,
    declined_by text,
    declined_reason text,
    metadata jsonb,
    declined_at timestamp with time zone,
    canceled_by text,
    canceled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    change_type text,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text,
    CONSTRAINT order_change_status_check CHECK ((status = ANY (ARRAY['confirmed'::text, 'declined'::text, 'requested'::text, 'pending'::text, 'canceled'::text])))
);


ALTER TABLE public.order_change OWNER TO raychou;

--
-- TOC entry 282 (class 1259 OID 163102)
-- Name: order_change_action; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_change_action (
    id text NOT NULL,
    order_id text,
    version integer,
    ordering bigint NOT NULL,
    order_change_id text,
    reference text,
    reference_id text,
    action text NOT NULL,
    details jsonb,
    amount numeric,
    raw_amount jsonb,
    internal_note text,
    applied boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text
);


ALTER TABLE public.order_change_action OWNER TO raychou;

--
-- TOC entry 281 (class 1259 OID 163101)
-- Name: order_change_action_ordering_seq; Type: SEQUENCE; Schema: public; Owner: raychou
--

CREATE SEQUENCE public.order_change_action_ordering_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_change_action_ordering_seq OWNER TO raychou;

--
-- TOC entry 5464 (class 0 OID 0)
-- Dependencies: 281
-- Name: order_change_action_ordering_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raychou
--

ALTER SEQUENCE public.order_change_action_ordering_seq OWNED BY public.order_change_action.ordering;


--
-- TOC entry 300 (class 1259 OID 163388)
-- Name: order_claim; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_claim (
    id text NOT NULL,
    order_id text NOT NULL,
    return_id text,
    order_version integer NOT NULL,
    display_id integer NOT NULL,
    type public.order_claim_type_enum NOT NULL,
    no_notification boolean,
    refund_amount numeric,
    raw_refund_amount jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    canceled_at timestamp with time zone,
    created_by text
);


ALTER TABLE public.order_claim OWNER TO raychou;

--
-- TOC entry 299 (class 1259 OID 163387)
-- Name: order_claim_display_id_seq; Type: SEQUENCE; Schema: public; Owner: raychou
--

CREATE SEQUENCE public.order_claim_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_claim_display_id_seq OWNER TO raychou;

--
-- TOC entry 5465 (class 0 OID 0)
-- Dependencies: 299
-- Name: order_claim_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raychou
--

ALTER SEQUENCE public.order_claim_display_id_seq OWNED BY public.order_claim.display_id;


--
-- TOC entry 301 (class 1259 OID 163411)
-- Name: order_claim_item; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_claim_item (
    id text NOT NULL,
    claim_id text NOT NULL,
    item_id text NOT NULL,
    is_additional_item boolean DEFAULT false NOT NULL,
    reason public.claim_reason_enum,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    note text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_claim_item OWNER TO raychou;

--
-- TOC entry 302 (class 1259 OID 163424)
-- Name: order_claim_item_image; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_claim_item_image (
    id text NOT NULL,
    claim_item_id text NOT NULL,
    url text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_claim_item_image OWNER TO raychou;

--
-- TOC entry 303 (class 1259 OID 163482)
-- Name: order_credit_line; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_credit_line (
    id text NOT NULL,
    order_id text NOT NULL,
    reference text,
    reference_id text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_credit_line OWNER TO raychou;

--
-- TOC entry 277 (class 1259 OID 163034)
-- Name: order_display_id_seq; Type: SEQUENCE; Schema: public; Owner: raychou
--

CREATE SEQUENCE public.order_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_display_id_seq OWNER TO raychou;

--
-- TOC entry 5466 (class 0 OID 0)
-- Dependencies: 277
-- Name: order_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raychou
--

ALTER SEQUENCE public.order_display_id_seq OWNED BY public."order".display_id;


--
-- TOC entry 297 (class 1259 OID 163354)
-- Name: order_exchange; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_exchange (
    id text NOT NULL,
    order_id text NOT NULL,
    return_id text,
    order_version integer NOT NULL,
    display_id integer NOT NULL,
    no_notification boolean,
    allow_backorder boolean DEFAULT false NOT NULL,
    difference_due numeric,
    raw_difference_due jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    canceled_at timestamp with time zone,
    created_by text
);


ALTER TABLE public.order_exchange OWNER TO raychou;

--
-- TOC entry 296 (class 1259 OID 163353)
-- Name: order_exchange_display_id_seq; Type: SEQUENCE; Schema: public; Owner: raychou
--

CREATE SEQUENCE public.order_exchange_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_exchange_display_id_seq OWNER TO raychou;

--
-- TOC entry 5467 (class 0 OID 0)
-- Dependencies: 296
-- Name: order_exchange_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raychou
--

ALTER SEQUENCE public.order_exchange_display_id_seq OWNED BY public.order_exchange.display_id;


--
-- TOC entry 298 (class 1259 OID 163369)
-- Name: order_exchange_item; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_exchange_item (
    id text NOT NULL,
    exchange_id text NOT NULL,
    item_id text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    note text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_exchange_item OWNER TO raychou;

--
-- TOC entry 329 (class 1259 OID 163888)
-- Name: order_fulfillment; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_fulfillment (
    order_id character varying(255) NOT NULL,
    fulfillment_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_fulfillment OWNER TO raychou;

--
-- TOC entry 283 (class 1259 OID 163116)
-- Name: order_item; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_item (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer NOT NULL,
    item_id text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    fulfilled_quantity numeric NOT NULL,
    raw_fulfilled_quantity jsonb NOT NULL,
    shipped_quantity numeric NOT NULL,
    raw_shipped_quantity jsonb NOT NULL,
    return_requested_quantity numeric NOT NULL,
    raw_return_requested_quantity jsonb NOT NULL,
    return_received_quantity numeric NOT NULL,
    raw_return_received_quantity jsonb NOT NULL,
    return_dismissed_quantity numeric NOT NULL,
    raw_return_dismissed_quantity jsonb NOT NULL,
    written_off_quantity numeric NOT NULL,
    raw_written_off_quantity jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    delivered_quantity numeric DEFAULT 0 NOT NULL,
    raw_delivered_quantity jsonb NOT NULL,
    unit_price numeric,
    raw_unit_price jsonb,
    compare_at_unit_price numeric,
    raw_compare_at_unit_price jsonb
);


ALTER TABLE public.order_item OWNER TO raychou;

--
-- TOC entry 285 (class 1259 OID 163140)
-- Name: order_line_item; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_line_item (
    id text NOT NULL,
    totals_id text,
    title text NOT NULL,
    subtitle text,
    thumbnail text,
    variant_id text,
    product_id text,
    product_title text,
    product_description text,
    product_subtitle text,
    product_type text,
    product_collection text,
    product_handle text,
    variant_sku text,
    variant_barcode text,
    variant_title text,
    variant_option_values jsonb,
    requires_shipping boolean DEFAULT true NOT NULL,
    is_discountable boolean DEFAULT true NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    compare_at_unit_price numeric,
    raw_compare_at_unit_price jsonb,
    unit_price numeric NOT NULL,
    raw_unit_price jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    is_custom_price boolean DEFAULT false NOT NULL,
    product_type_id text,
    is_giftcard boolean DEFAULT false NOT NULL
);


ALTER TABLE public.order_line_item OWNER TO raychou;

--
-- TOC entry 287 (class 1259 OID 163164)
-- Name: order_line_item_adjustment; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_line_item_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    item_id text NOT NULL,
    deleted_at timestamp with time zone,
    is_tax_inclusive boolean DEFAULT false NOT NULL
);


ALTER TABLE public.order_line_item_adjustment OWNER TO raychou;

--
-- TOC entry 286 (class 1259 OID 163154)
-- Name: order_line_item_tax_line; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_line_item_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate numeric NOT NULL,
    raw_rate jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    item_id text NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_line_item_tax_line OWNER TO raychou;

--
-- TOC entry 330 (class 1259 OID 163894)
-- Name: order_payment_collection; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_payment_collection (
    order_id character varying(255) NOT NULL,
    payment_collection_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_payment_collection OWNER TO raychou;

--
-- TOC entry 331 (class 1259 OID 163902)
-- Name: order_promotion; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_promotion (
    order_id character varying(255) NOT NULL,
    promotion_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_promotion OWNER TO raychou;

--
-- TOC entry 284 (class 1259 OID 163128)
-- Name: order_shipping; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_shipping (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer NOT NULL,
    shipping_method_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text
);


ALTER TABLE public.order_shipping OWNER TO raychou;

--
-- TOC entry 288 (class 1259 OID 163174)
-- Name: order_shipping_method; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_shipping_method (
    id text NOT NULL,
    name text NOT NULL,
    description jsonb,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    shipping_option_id text,
    data jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    is_custom_amount boolean DEFAULT false NOT NULL
);


ALTER TABLE public.order_shipping_method OWNER TO raychou;

--
-- TOC entry 289 (class 1259 OID 163185)
-- Name: order_shipping_method_adjustment; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_shipping_method_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    shipping_method_id text NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_shipping_method_adjustment OWNER TO raychou;

--
-- TOC entry 290 (class 1259 OID 163195)
-- Name: order_shipping_method_tax_line; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_shipping_method_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate numeric NOT NULL,
    raw_rate jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    shipping_method_id text NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_shipping_method_tax_line OWNER TO raychou;

--
-- TOC entry 279 (class 1259 OID 163076)
-- Name: order_summary; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_summary (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    totals jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_summary OWNER TO raychou;

--
-- TOC entry 291 (class 1259 OID 163205)
-- Name: order_transaction; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.order_transaction (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    currency_code text NOT NULL,
    reference text,
    reference_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text
);


ALTER TABLE public.order_transaction OWNER TO raychou;

--
-- TOC entry 271 (class 1259 OID 162898)
-- Name: payment; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.payment (
    id text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    currency_code text NOT NULL,
    provider_id text NOT NULL,
    data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    captured_at timestamp with time zone,
    canceled_at timestamp with time zone,
    payment_collection_id text NOT NULL,
    payment_session_id text NOT NULL,
    metadata jsonb
);


ALTER TABLE public.payment OWNER TO raychou;

--
-- TOC entry 267 (class 1259 OID 162852)
-- Name: payment_collection; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.payment_collection (
    id text NOT NULL,
    currency_code text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    authorized_amount numeric,
    raw_authorized_amount jsonb,
    captured_amount numeric,
    raw_captured_amount jsonb,
    refunded_amount numeric,
    raw_refunded_amount jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    completed_at timestamp with time zone,
    status text DEFAULT 'not_paid'::text NOT NULL,
    metadata jsonb,
    CONSTRAINT payment_collection_status_check CHECK ((status = ANY (ARRAY['not_paid'::text, 'awaiting'::text, 'authorized'::text, 'partially_authorized'::text, 'canceled'::text, 'failed'::text, 'partially_captured'::text, 'completed'::text])))
);


ALTER TABLE public.payment_collection OWNER TO raychou;

--
-- TOC entry 269 (class 1259 OID 162880)
-- Name: payment_collection_payment_providers; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.payment_collection_payment_providers (
    payment_collection_id text NOT NULL,
    payment_provider_id text NOT NULL
);


ALTER TABLE public.payment_collection_payment_providers OWNER TO raychou;

--
-- TOC entry 268 (class 1259 OID 162872)
-- Name: payment_provider; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.payment_provider (
    id text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.payment_provider OWNER TO raychou;

--
-- TOC entry 270 (class 1259 OID 162887)
-- Name: payment_session; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.payment_session (
    id text NOT NULL,
    currency_code text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    context jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    authorized_at timestamp with time zone,
    payment_collection_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT payment_session_status_check CHECK ((status = ANY (ARRAY['authorized'::text, 'captured'::text, 'pending'::text, 'requires_more'::text, 'error'::text, 'canceled'::text])))
);


ALTER TABLE public.payment_session OWNER TO raychou;

--
-- TOC entry 229 (class 1259 OID 161951)
-- Name: price; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.price (
    id text NOT NULL,
    title text,
    price_set_id text NOT NULL,
    currency_code text NOT NULL,
    raw_amount jsonb NOT NULL,
    rules_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    price_list_id text,
    amount numeric NOT NULL,
    min_quantity integer,
    max_quantity integer
);


ALTER TABLE public.price OWNER TO raychou;

--
-- TOC entry 231 (class 1259 OID 162027)
-- Name: price_list; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.price_list (
    id text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    rules_count integer DEFAULT 0,
    title text NOT NULL,
    description text NOT NULL,
    type text DEFAULT 'sale'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT price_list_status_check CHECK ((status = ANY (ARRAY['active'::text, 'draft'::text]))),
    CONSTRAINT price_list_type_check CHECK ((type = ANY (ARRAY['sale'::text, 'override'::text])))
);


ALTER TABLE public.price_list OWNER TO raychou;

--
-- TOC entry 232 (class 1259 OID 162037)
-- Name: price_list_rule; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.price_list_rule (
    id text NOT NULL,
    price_list_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    value jsonb,
    attribute text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.price_list_rule OWNER TO raychou;

--
-- TOC entry 233 (class 1259 OID 162132)
-- Name: price_preference; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.price_preference (
    id text NOT NULL,
    attribute text NOT NULL,
    value text,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.price_preference OWNER TO raychou;

--
-- TOC entry 230 (class 1259 OID 161982)
-- Name: price_rule; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.price_rule (
    id text NOT NULL,
    value text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    price_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    attribute text DEFAULT ''::text NOT NULL,
    operator text DEFAULT 'eq'::text NOT NULL,
    CONSTRAINT price_rule_operator_check CHECK ((operator = ANY (ARRAY['gte'::text, 'lte'::text, 'gt'::text, 'lt'::text, 'eq'::text])))
);


ALTER TABLE public.price_rule OWNER TO raychou;

--
-- TOC entry 228 (class 1259 OID 161942)
-- Name: price_set; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.price_set (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.price_set OWNER TO raychou;

--
-- TOC entry 216 (class 1259 OID 161629)
-- Name: product; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product (
    id text NOT NULL,
    title text NOT NULL,
    handle text NOT NULL,
    subtitle text,
    description text,
    is_giftcard boolean DEFAULT false NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    thumbnail text,
    weight text,
    length text,
    height text,
    width text,
    origin_country text,
    hs_code text,
    mid_code text,
    material text,
    collection_id text,
    type_id text,
    discountable boolean DEFAULT true NOT NULL,
    external_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    metadata jsonb,
    CONSTRAINT product_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'proposed'::text, 'published'::text, 'rejected'::text])))
);


ALTER TABLE public.product OWNER TO raychou;

--
-- TOC entry 224 (class 1259 OID 161729)
-- Name: product_category; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_category (
    id text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    handle text NOT NULL,
    mpath text NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    is_internal boolean DEFAULT false NOT NULL,
    rank integer DEFAULT 0 NOT NULL,
    parent_category_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    metadata jsonb
);


ALTER TABLE public.product_category OWNER TO raychou;

--
-- TOC entry 226 (class 1259 OID 161759)
-- Name: product_category_product; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_category_product (
    product_id text NOT NULL,
    product_category_id text NOT NULL
);


ALTER TABLE public.product_category_product OWNER TO raychou;

--
-- TOC entry 223 (class 1259 OID 161718)
-- Name: product_collection; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_collection (
    id text NOT NULL,
    title text NOT NULL,
    handle text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_collection OWNER TO raychou;

--
-- TOC entry 218 (class 1259 OID 161663)
-- Name: product_option; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_option (
    id text NOT NULL,
    title text NOT NULL,
    product_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_option OWNER TO raychou;

--
-- TOC entry 219 (class 1259 OID 161674)
-- Name: product_option_value; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_option_value (
    id text NOT NULL,
    value text NOT NULL,
    option_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_option_value OWNER TO raychou;

--
-- TOC entry 334 (class 1259 OID 163935)
-- Name: product_sales_channel; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_sales_channel (
    product_id character varying(255) NOT NULL,
    sales_channel_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_sales_channel OWNER TO raychou;

--
-- TOC entry 342 (class 1259 OID 164041)
-- Name: product_shipping_profile; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_shipping_profile (
    product_id character varying(255) NOT NULL,
    shipping_profile_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_shipping_profile OWNER TO raychou;

--
-- TOC entry 221 (class 1259 OID 161696)
-- Name: product_tag; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_tag (
    id text NOT NULL,
    value text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_tag OWNER TO raychou;

--
-- TOC entry 225 (class 1259 OID 161745)
-- Name: product_tags; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_tags (
    product_id text NOT NULL,
    product_tag_id text NOT NULL
);


ALTER TABLE public.product_tags OWNER TO raychou;

--
-- TOC entry 222 (class 1259 OID 161707)
-- Name: product_type; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_type (
    id text NOT NULL,
    value text NOT NULL,
    metadata json,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_type OWNER TO raychou;

--
-- TOC entry 217 (class 1259 OID 161645)
-- Name: product_variant; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_variant (
    id text NOT NULL,
    title text NOT NULL,
    sku text,
    barcode text,
    ean text,
    upc text,
    allow_backorder boolean DEFAULT false NOT NULL,
    manage_inventory boolean DEFAULT true NOT NULL,
    hs_code text,
    origin_country text,
    mid_code text,
    material text,
    weight integer,
    length integer,
    height integer,
    width integer,
    metadata jsonb,
    variant_rank integer DEFAULT 0,
    product_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_variant OWNER TO raychou;

--
-- TOC entry 333 (class 1259 OID 163932)
-- Name: product_variant_inventory_item; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_variant_inventory_item (
    variant_id character varying(255) NOT NULL,
    inventory_item_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    required_quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_variant_inventory_item OWNER TO raychou;

--
-- TOC entry 227 (class 1259 OID 161766)
-- Name: product_variant_option; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_variant_option (
    variant_id text NOT NULL,
    option_value_id text NOT NULL
);


ALTER TABLE public.product_variant_option OWNER TO raychou;

--
-- TOC entry 335 (class 1259 OID 163980)
-- Name: product_variant_price_set; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.product_variant_price_set (
    variant_id character varying(255) NOT NULL,
    price_set_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_variant_price_set OWNER TO raychou;

--
-- TOC entry 236 (class 1259 OID 162200)
-- Name: promotion; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.promotion (
    id text NOT NULL,
    code text NOT NULL,
    campaign_id text,
    is_automatic boolean DEFAULT false NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    CONSTRAINT promotion_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'inactive'::text]))),
    CONSTRAINT promotion_type_check CHECK ((type = ANY (ARRAY['standard'::text, 'buyget'::text])))
);


ALTER TABLE public.promotion OWNER TO raychou;

--
-- TOC entry 237 (class 1259 OID 162215)
-- Name: promotion_application_method; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.promotion_application_method (
    id text NOT NULL,
    value numeric,
    raw_value jsonb,
    max_quantity integer,
    apply_to_quantity integer,
    buy_rules_min_quantity integer,
    type text NOT NULL,
    target_type text NOT NULL,
    allocation text,
    promotion_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    currency_code text,
    CONSTRAINT promotion_application_method_allocation_check CHECK ((allocation = ANY (ARRAY['each'::text, 'across'::text]))),
    CONSTRAINT promotion_application_method_target_type_check CHECK ((target_type = ANY (ARRAY['order'::text, 'shipping_methods'::text, 'items'::text]))),
    CONSTRAINT promotion_application_method_type_check CHECK ((type = ANY (ARRAY['fixed'::text, 'percentage'::text])))
);


ALTER TABLE public.promotion_application_method OWNER TO raychou;

--
-- TOC entry 234 (class 1259 OID 162175)
-- Name: promotion_campaign; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.promotion_campaign (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    campaign_identifier text NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.promotion_campaign OWNER TO raychou;

--
-- TOC entry 235 (class 1259 OID 162186)
-- Name: promotion_campaign_budget; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.promotion_campaign_budget (
    id text NOT NULL,
    type text NOT NULL,
    campaign_id text NOT NULL,
    "limit" numeric,
    raw_limit jsonb,
    used numeric DEFAULT 0 NOT NULL,
    raw_used jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    currency_code text,
    CONSTRAINT promotion_campaign_budget_type_check CHECK ((type = ANY (ARRAY['spend'::text, 'usage'::text])))
);


ALTER TABLE public.promotion_campaign_budget OWNER TO raychou;

--
-- TOC entry 239 (class 1259 OID 162244)
-- Name: promotion_promotion_rule; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.promotion_promotion_rule (
    promotion_id text NOT NULL,
    promotion_rule_id text NOT NULL
);


ALTER TABLE public.promotion_promotion_rule OWNER TO raychou;

--
-- TOC entry 238 (class 1259 OID 162232)
-- Name: promotion_rule; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.promotion_rule (
    id text NOT NULL,
    description text,
    attribute text NOT NULL,
    operator text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT promotion_rule_operator_check CHECK ((operator = ANY (ARRAY['gte'::text, 'lte'::text, 'gt'::text, 'lt'::text, 'eq'::text, 'ne'::text, 'in'::text])))
);


ALTER TABLE public.promotion_rule OWNER TO raychou;

--
-- TOC entry 242 (class 1259 OID 162265)
-- Name: promotion_rule_value; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.promotion_rule_value (
    id text NOT NULL,
    promotion_rule_id text NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.promotion_rule_value OWNER TO raychou;

--
-- TOC entry 305 (class 1259 OID 163519)
-- Name: provider_identity; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.provider_identity (
    id text NOT NULL,
    entity_id text NOT NULL,
    provider text NOT NULL,
    auth_identity_id text NOT NULL,
    user_metadata jsonb,
    provider_metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.provider_identity OWNER TO raychou;

--
-- TOC entry 336 (class 1259 OID 164006)
-- Name: publishable_api_key_sales_channel; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.publishable_api_key_sales_channel (
    publishable_key_id character varying(255) NOT NULL,
    sales_channel_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.publishable_api_key_sales_channel OWNER TO raychou;

--
-- TOC entry 272 (class 1259 OID 162907)
-- Name: refund; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.refund (
    id text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    payment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by text,
    metadata jsonb,
    refund_reason_id text,
    note text
);


ALTER TABLE public.refund OWNER TO raychou;

--
-- TOC entry 274 (class 1259 OID 162966)
-- Name: refund_reason; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.refund_reason (
    id text NOT NULL,
    label text NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.refund_reason OWNER TO raychou;

--
-- TOC entry 257 (class 1259 OID 162695)
-- Name: region; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.region (
    id text NOT NULL,
    name text NOT NULL,
    currency_code text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    automatic_taxes boolean DEFAULT true NOT NULL
);


ALTER TABLE public.region OWNER TO raychou;

--
-- TOC entry 258 (class 1259 OID 162706)
-- Name: region_country; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.region_country (
    iso_2 text NOT NULL,
    iso_3 text NOT NULL,
    num_code text NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    region_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.region_country OWNER TO raychou;

--
-- TOC entry 337 (class 1259 OID 164013)
-- Name: region_payment_provider; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.region_payment_provider (
    region_id character varying(255) NOT NULL,
    payment_provider_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.region_payment_provider OWNER TO raychou;

--
-- TOC entry 215 (class 1259 OID 161553)
-- Name: reservation_item; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.reservation_item (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    line_item_id text,
    location_id text NOT NULL,
    quantity numeric NOT NULL,
    external_id text,
    description text,
    created_by text,
    metadata jsonb,
    inventory_item_id text NOT NULL,
    allow_backorder boolean DEFAULT false,
    raw_quantity jsonb
);


ALTER TABLE public.reservation_item OWNER TO raychou;

--
-- TOC entry 294 (class 1259 OID 163324)
-- Name: return; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.return (
    id text NOT NULL,
    order_id text NOT NULL,
    claim_id text,
    exchange_id text,
    order_version integer NOT NULL,
    display_id integer NOT NULL,
    status public.return_status_enum DEFAULT 'open'::public.return_status_enum NOT NULL,
    no_notification boolean,
    refund_amount numeric,
    raw_refund_amount jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    received_at timestamp with time zone,
    canceled_at timestamp with time zone,
    location_id text,
    requested_at timestamp with time zone,
    created_by text
);


ALTER TABLE public.return OWNER TO raychou;

--
-- TOC entry 293 (class 1259 OID 163323)
-- Name: return_display_id_seq; Type: SEQUENCE; Schema: public; Owner: raychou
--

CREATE SEQUENCE public.return_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.return_display_id_seq OWNER TO raychou;

--
-- TOC entry 5468 (class 0 OID 0)
-- Dependencies: 293
-- Name: return_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raychou
--

ALTER SEQUENCE public.return_display_id_seq OWNED BY public.return.display_id;


--
-- TOC entry 332 (class 1259 OID 163928)
-- Name: return_fulfillment; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.return_fulfillment (
    return_id character varying(255) NOT NULL,
    fulfillment_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.return_fulfillment OWNER TO raychou;

--
-- TOC entry 295 (class 1259 OID 163339)
-- Name: return_item; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.return_item (
    id text NOT NULL,
    return_id text NOT NULL,
    reason_id text,
    item_id text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    received_quantity numeric DEFAULT 0 NOT NULL,
    raw_received_quantity jsonb NOT NULL,
    note text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    damaged_quantity numeric DEFAULT 0 NOT NULL,
    raw_damaged_quantity jsonb NOT NULL
);


ALTER TABLE public.return_item OWNER TO raychou;

--
-- TOC entry 292 (class 1259 OID 163218)
-- Name: return_reason; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.return_reason (
    id character varying NOT NULL,
    value character varying NOT NULL,
    label character varying NOT NULL,
    description character varying,
    metadata jsonb,
    parent_return_reason_id character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.return_reason OWNER TO raychou;

--
-- TOC entry 247 (class 1259 OID 162465)
-- Name: sales_channel; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.sales_channel (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    is_disabled boolean DEFAULT false NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.sales_channel OWNER TO raychou;

--
-- TOC entry 338 (class 1259 OID 164014)
-- Name: sales_channel_stock_location; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.sales_channel_stock_location (
    sales_channel_id character varying(255) NOT NULL,
    stock_location_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.sales_channel_stock_location OWNER TO raychou;

--
-- TOC entry 344 (class 1259 OID 164105)
-- Name: script_migrations; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.script_migrations (
    id integer NOT NULL,
    script_name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    finished_at timestamp with time zone
);


ALTER TABLE public.script_migrations OWNER TO raychou;

--
-- TOC entry 343 (class 1259 OID 164104)
-- Name: script_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: raychou
--

CREATE SEQUENCE public.script_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.script_migrations_id_seq OWNER TO raychou;

--
-- TOC entry 5469 (class 0 OID 0)
-- Dependencies: 343
-- Name: script_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: raychou
--

ALTER SEQUENCE public.script_migrations_id_seq OWNED BY public.script_migrations.id;


--
-- TOC entry 311 (class 1259 OID 163595)
-- Name: service_zone; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.service_zone (
    id text NOT NULL,
    name text NOT NULL,
    metadata jsonb,
    fulfillment_set_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.service_zone OWNER TO raychou;

--
-- TOC entry 315 (class 1259 OID 163644)
-- Name: shipping_option; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.shipping_option (
    id text NOT NULL,
    name text NOT NULL,
    price_type text DEFAULT 'flat'::text NOT NULL,
    service_zone_id text NOT NULL,
    shipping_profile_id text,
    provider_id text,
    data jsonb,
    metadata jsonb,
    shipping_option_type_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT shipping_option_price_type_check CHECK ((price_type = ANY (ARRAY['calculated'::text, 'flat'::text])))
);


ALTER TABLE public.shipping_option OWNER TO raychou;

--
-- TOC entry 339 (class 1259 OID 164019)
-- Name: shipping_option_price_set; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.shipping_option_price_set (
    shipping_option_id character varying(255) NOT NULL,
    price_set_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.shipping_option_price_set OWNER TO raychou;

--
-- TOC entry 316 (class 1259 OID 163662)
-- Name: shipping_option_rule; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.shipping_option_rule (
    id text NOT NULL,
    attribute text NOT NULL,
    operator text NOT NULL,
    value jsonb,
    shipping_option_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT shipping_option_rule_operator_check CHECK ((operator = ANY (ARRAY['in'::text, 'eq'::text, 'ne'::text, 'gt'::text, 'gte'::text, 'lt'::text, 'lte'::text, 'nin'::text])))
);


ALTER TABLE public.shipping_option_rule OWNER TO raychou;

--
-- TOC entry 313 (class 1259 OID 163623)
-- Name: shipping_option_type; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.shipping_option_type (
    id text NOT NULL,
    label text NOT NULL,
    description text,
    code text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.shipping_option_type OWNER TO raychou;

--
-- TOC entry 314 (class 1259 OID 163633)
-- Name: shipping_profile; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.shipping_profile (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.shipping_profile OWNER TO raychou;

--
-- TOC entry 212 (class 1259 OID 161502)
-- Name: stock_location; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.stock_location (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name text NOT NULL,
    address_id text,
    metadata jsonb
);


ALTER TABLE public.stock_location OWNER TO raychou;

--
-- TOC entry 211 (class 1259 OID 161492)
-- Name: stock_location_address; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.stock_location_address (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    address_1 text NOT NULL,
    address_2 text,
    company text,
    city text,
    country_code text NOT NULL,
    phone text,
    province text,
    postal_code text,
    metadata jsonb
);


ALTER TABLE public.stock_location_address OWNER TO raychou;

--
-- TOC entry 260 (class 1259 OID 162737)
-- Name: store; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.store (
    id text NOT NULL,
    name text DEFAULT 'Medusa Store'::text NOT NULL,
    default_sales_channel_id text,
    default_region_id text,
    default_location_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.store OWNER TO raychou;

--
-- TOC entry 261 (class 1259 OID 162749)
-- Name: store_currency; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.store_currency (
    id text NOT NULL,
    currency_code text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    store_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.store_currency OWNER TO raychou;

--
-- TOC entry 262 (class 1259 OID 162766)
-- Name: tax_provider; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.tax_provider (
    id text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tax_provider OWNER TO raychou;

--
-- TOC entry 264 (class 1259 OID 162788)
-- Name: tax_rate; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.tax_rate (
    id text NOT NULL,
    rate real,
    code text NOT NULL,
    name text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    is_combinable boolean DEFAULT false NOT NULL,
    tax_region_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tax_rate OWNER TO raychou;

--
-- TOC entry 265 (class 1259 OID 162802)
-- Name: tax_rate_rule; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.tax_rate_rule (
    id text NOT NULL,
    tax_rate_id text NOT NULL,
    reference_id text NOT NULL,
    reference text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tax_rate_rule OWNER TO raychou;

--
-- TOC entry 263 (class 1259 OID 162774)
-- Name: tax_region; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.tax_region (
    id text NOT NULL,
    provider_id text,
    country_code text NOT NULL,
    province_code text,
    parent_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone,
    CONSTRAINT "CK_tax_region_country_top_level" CHECK (((parent_id IS NULL) OR (province_code IS NOT NULL))),
    CONSTRAINT "CK_tax_region_provider_top_level" CHECK (((parent_id IS NULL) OR (provider_id IS NULL)))
);


ALTER TABLE public.tax_region OWNER TO raychou;

--
-- TOC entry 307 (class 1259 OID 163552)
-- Name: user; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public."user" (
    id text NOT NULL,
    first_name text,
    last_name text,
    email text NOT NULL,
    avatar_url text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public."user" OWNER TO raychou;

--
-- TOC entry 322 (class 1259 OID 163834)
-- Name: workflow_execution; Type: TABLE; Schema: public; Owner: raychou
--

CREATE TABLE public.workflow_execution (
    id character varying NOT NULL,
    workflow_id character varying NOT NULL,
    transaction_id character varying NOT NULL,
    execution jsonb,
    context jsonb,
    state character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    retention_time integer,
    run_id text DEFAULT '01K24WH4XR6X0WK1E2DFVPYJF2'::text NOT NULL
);


ALTER TABLE public.workflow_execution OWNER TO raychou;

--
-- TOC entry 4381 (class 2604 OID 163860)
-- Name: link_module_migrations id; Type: DEFAULT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.link_module_migrations ALTER COLUMN id SET DEFAULT nextval('public.link_module_migrations_id_seq'::regclass);


--
-- TOC entry 4067 (class 2604 OID 161488)
-- Name: mikro_orm_migrations id; Type: DEFAULT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.mikro_orm_migrations ALTER COLUMN id SET DEFAULT nextval('public.mikro_orm_migrations_id_seq'::regclass);


--
-- TOC entry 4259 (class 2604 OID 163038)
-- Name: order display_id; Type: DEFAULT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public."order" ALTER COLUMN display_id SET DEFAULT nextval('public.order_display_id_seq'::regclass);


--
-- TOC entry 4272 (class 2604 OID 163105)
-- Name: order_change_action ordering; Type: DEFAULT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_change_action ALTER COLUMN ordering SET DEFAULT nextval('public.order_change_action_ordering_seq'::regclass);


--
-- TOC entry 4320 (class 2604 OID 163391)
-- Name: order_claim display_id; Type: DEFAULT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_claim ALTER COLUMN display_id SET DEFAULT nextval('public.order_claim_display_id_seq'::regclass);


--
-- TOC entry 4314 (class 2604 OID 163357)
-- Name: order_exchange display_id; Type: DEFAULT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_exchange ALTER COLUMN display_id SET DEFAULT nextval('public.order_exchange_display_id_seq'::regclass);


--
-- TOC entry 4306 (class 2604 OID 163327)
-- Name: return display_id; Type: DEFAULT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.return ALTER COLUMN display_id SET DEFAULT nextval('public.return_display_id_seq'::regclass);


--
-- TOC entry 4421 (class 2604 OID 164108)
-- Name: script_migrations id; Type: DEFAULT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.script_migrations ALTER COLUMN id SET DEFAULT nextval('public.script_migrations_id_seq'::regclass);


--
-- TOC entry 5378 (class 0 OID 163000)
-- Dependencies: 275
-- Data for Name: account_holder; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.account_holder (id, provider_id, external_id, email, data, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5449 (class 0 OID 169704)
-- Dependencies: 346
-- Data for Name: affiliate_click; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.affiliate_click (id, affiliate_code, product_id, ip_address, user_agent, referrer_url, session_id, converted, created_at, updated_at, deleted_at) FROM stdin;
click_001	YABEAU2025	prod_01JD6FX3F0V7GXKDGR8W7MKCAJ	192.168.1.100	Mozilla/5.0...	\N	\N	f	2025-08-07 00:44:10.557342+08	2025-08-07 00:44:10.557342+08	\N
click_002	YABEAU2025	prod_01JD6FX3F0V7GXKDGR8W7MKCAJ	192.168.1.101	Mozilla/5.0...	\N	\N	t	2025-08-09 00:44:10.557342+08	2025-08-09 00:44:10.557342+08	\N
click_003	HUALIFE2025	prod_01JD6FX3F0V7GXKDGR8W7MKCAJ	192.168.1.102	Safari...	\N	\N	f	2025-08-10 00:44:10.557342+08	2025-08-10 00:44:10.557342+08	\N
click_004	YABEAU2025	\N	192.168.1.103	Chrome...	\N	\N	f	2025-08-11 00:44:10.557342+08	2025-08-11 00:44:10.557342+08	\N
click_005	HUALIFE2025	prod_01JD6FX3F0V7GXKDGR8W7MKCAJ	192.168.1.104	Firefox...	\N	\N	t	2025-08-11 00:44:10.557342+08	2025-08-11 00:44:10.557342+08	\N
\.


--
-- TOC entry 5450 (class 0 OID 169715)
-- Dependencies: 347
-- Data for Name: affiliate_conversion; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.affiliate_conversion (id, affiliate_code, order_id, order_total, commission_rate, commission_amount, status, click_id, paid_at, payment_reference, raw_order_total, raw_commission_rate, raw_commission_amount, created_at, updated_at, deleted_at) FROM stdin;
conv_001	YABEAU2025	order_001	2400	0.08	192	confirmed	click_002	\N	\N	{"value": 2400, "currency_code": "TWD"}	{"value": 0.08}	{"value": 192, "currency_code": "TWD"}	2025-08-09 00:44:21.507734+08	2025-08-09 00:44:21.507734+08	\N
conv_002	HUALIFE2025	order_002	1800	0.08	144	pending	click_005	\N	\N	{"value": 1800, "currency_code": "TWD"}	{"value": 0.08}	{"value": 144, "currency_code": "TWD"}	2025-08-11 00:44:21.507734+08	2025-08-11 00:44:21.507734+08	\N
conv_003	YABEAU2025	order_003	3200	0.08	256	confirmed	\N	\N	\N	{"value": 3200, "currency_code": "TWD"}	{"value": 0.08}	{"value": 256, "currency_code": "TWD"}	2025-08-05 00:44:21.507734+08	2025-08-05 00:44:21.507734+08	\N
conv_ya_001	YA002	order_004	1680.00	0.05	84.00	confirmed	\N	\N	\N	1680	0.05	84	2025-08-08 12:34:23.045148+08	2025-08-08 12:34:23.045148+08	\N
conv_ya_002	YA002	order_005	2200.00	0.05	110.00	paid	\N	\N	\N	2200	0.05	110	2025-08-10 12:34:23.045148+08	2025-08-12 06:34:23.045148+08	\N
conv_jay_001	JAY005	order_006	4580.00	0.05	229.00	pending	\N	\N	\N	4580	0.05	229	2025-08-11 12:34:23.045148+08	2025-08-11 12:34:23.045148+08	\N
conv_jay_002	JAY005	order_007	3200.00	0.05	160.00	confirmed	\N	\N	\N	3200	0.05	160	2025-08-12 06:34:23.045148+08	2025-08-12 06:34:23.045148+08	\N
conv_ming_001	MING2025	order_001	2580.00	0.05	129.00	confirmed	\N	\N	\N	2580	0.05	129	2025-08-07 12:34:23.045148+08	2025-08-07 12:34:23.045148+08	\N
conv_ming_002	MING2025	order_002	1899.00	0.05	94.95	paid	\N	\N	\N	1899	0.05	94.95	2025-08-09 12:34:23.045148+08	2025-08-11 12:34:23.045148+08	\N
conv_ming_003	MING2025	order_003	3250.00	0.05	162.50	pending	\N	\N	\N	3250	0.05	162.50	2025-08-11 12:34:23.045148+08	2025-08-11 12:34:23.045148+08	\N
\.


--
-- TOC entry 5448 (class 0 OID 164157)
-- Dependencies: 345
-- Data for Name: affiliate_partner; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.affiliate_partner (id, name, partner_code, email, phone, commission_rate, status, rejection_reason, approved_by, approved_at, metadata, total_orders, total_commission_earned, total_commission_paid, last_order_at, password_hash, website, affiliate_code, referral_link, created_at, updated_at, deleted_at, social_media, address, account_name, bank_code, account_number, tax_id, referred_by_code, total_referrals) FROM stdin;
aff_003	生活風格阿華	HUA003	hua@lifestyle.tw	0934-567-890	0.1200	approved	\N	\N	\N	{"platform": "Facebook", "followers": "50K+", "specialty": "生活品味"}	0	0.00	0.00	\N	\N	https://hua-lifestyle.com	HUALIFE2025	https://timsfantasyworld.com?ref=HUALIFE2025	2025-08-09 13:59:00.730034+08	2025-08-09 13:59:00.730034+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_004	新手媽咪小婷	TING004	ting@momblog.com	0945-678-901	0.0600	pending	\N	\N	\N	{"platform": "部落格", "followers": "5K+", "specialty": "母嬰用品"}	0	0.00	0.00	\N	\N	https://ting-mom.blog.tw	TINGMOM2025	https://timsfantasyworld.com?ref=TINGMOM2025	2025-08-09 13:59:00.730034+08	2025-08-09 13:59:00.730034+08	\N	\N	\N	\N	\N	\N	\N	\N	0
test_1754730685126	測試會員	TEST001	test_1754730685126@example.com	0912345678	0.0800	pending	\N	\N	\N	{"test": true}	0	0.00	0.00	\N	$2b$10$nVQEYH2lI0bd21FbA7zxe.UZCdjprj1o8GfpA9IJbHscV2b7stR9O	https://test.com	TEST2025	https://timsfantasyworld.com?ref=TEST2025	2025-08-09 17:11:25.127115+08	2025-08-09 17:11:25.127115+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_1754975234087	詳細測試夥伴	詳細測試2025	detailed_test_1754975234024@example.com	0987-654-321	0.0500	pending	\N	\N	\N	\N	0	0.00	0.00	\N	\N	https://detailed-test.com	詳細測試2025	https://timsfantasyworld.com?ref=詳細測試2025	2025-08-12 13:07:14.087+08	2025-08-12 13:07:14.087+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_971753	測試用戶	測試用753	newtest@example.com	0912-345-678	0.0500	pending	\N	\N	\N	{"registered_from": "web", "registration_date": "2025-08-11T16:32:51.817Z"}	0	0.00	0.00	\N	$2b$10$ynMkg0i2yx2gboFgW5MtT.y2bSluohKxjCcd9dJrGuY5O12aGdjUu	https://test.example.com	測試用戶2025	https://timsfantasyworld.com?ref=測試用戶2025	2025-08-12 00:32:51.817+08	2025-08-12 00:32:51.817+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_101823	周震宇	周震宇823	bboy10121988@gmail.com	0983344735	0.0500	pending	\N	\N	\N	{"registered_from": "web", "registration_date": "2025-08-11T16:35:01.913Z"}	0	0.00	0.00	\N	$2b$10$EhAsSGFHd3iPY6DPnM9h2OXTmQXFG5tyPonRo7gGkTQWGgqQwkwI6	\N	周震宇2025	https://timsfantasyworld.com?ref=周震宇2025	2025-08-12 00:35:01.913+08	2025-08-12 00:35:01.913+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_1754975256640	最終測試夥伴1754975256574	最終測試2025	final_test_1754975256574@example.com	0900-000-000	0.0500	pending	\N	\N	\N	\N	0	0.00	0.00	\N	\N	https://final-test.com	最終測試2025	https://timsfantasyworld.com?ref=最終測試2025	2025-08-12 13:07:36.64+08	2025-08-12 13:07:36.64+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_1754975650042	完整測試夥伴	完整測試2025	complete_test_1754975649833@example.com	0912-345-678	0.0500	pending	\N	\N	\N	\N	0	0.00	0.00	\N	$2b$10$UMiFKrdauTGyzA.NWQpdY.xwyxh4dzlNOsK/hpytvx89kssRXSEiG	https://complete-test.com	完整測試2025	https://timsfantasyworld.com?ref=完整測試2025	2025-08-12 13:14:10.042+08	2025-08-12 13:14:10.042+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_1754975650128	推薦測試夥伴	推薦測試2025	referral_test_1754975649833@example.com	0987-654-321	0.0500	pending	\N	\N	\N	\N	0	0.00	0.00	\N	$2b$10$SWjNjtrRf8XpKHXheyGj3emytG0qlHDa4SSBHJV59btGYyQcx1Zna	https://referral-test.com	推薦測試2025	https://timsfantasyworld.com?ref=推薦測試2025	2025-08-12 13:14:10.128+08	2025-08-12 13:14:10.128+08	\N	\N	\N	\N	\N	\N	\N	MING2025	0
aff_1754975784453	完整測試夥伴A	完整測試001	duplicate_test_0_1754975784355@example.com	\N	0.0500	pending	\N	\N	\N	\N	0	0.00	0.00	\N	$2b$10$TqKBVWnh0pJIRN/t29B67uJXvf/Ag6BgKwS6kpHF4vcWn2sLFH47C	\N	完整測試001	https://timsfantasyworld.com?ref=完整測試001	2025-08-12 13:16:24.453+08	2025-08-12 13:16:24.453+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_1754975784533	完整測試夥伴B	完整測試002	duplicate_test_1_1754975784459@example.com	\N	0.0500	pending	\N	\N	\N	\N	0	0.00	0.00	\N	$2b$10$BVCQOsCFDUsdddpZ8/EnHetJtoI65HYbLHNMQMGoikpjkbbEUl0be	\N	完整測試002	https://timsfantasyworld.com?ref=完整測試002	2025-08-12 13:16:24.533+08	2025-08-12 13:16:24.533+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_005305	測試用戶1754972005251	測試用305	test1754972005251@example.com	0912-345-678	0.0500	pending	\N	\N	\N	{"registered_from": "web", "registration_date": "2025-08-12T04:13:25.371Z"}	0	0.00	0.00	\N	$2b$10$jrYrY3kyiySt10oUgpZYgO0JeUW/h4A/Cf5.gx0IKq42u1lWczuVq	https://test.example.com	測試用005305	https://timsfantasyworld.com?ref=測試用005305	2025-08-12 12:13:25.371+08	2025-08-12 12:13:25.371+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_002	美妝達人小雅	YA002	ya@beautyblog.com	0923-456-789	0.1000	approved	\N	\N	\N	{"platform": "YouTube", "followers": "25K+", "specialty": "美妝保養"}	0	0.00	0.00	\N	\N	https://ya-beauty.com	YA002	https://timsfantasyworld.com?ref=YABEAU2025	2025-08-09 13:59:00.730034+08	2025-08-09 13:59:00.730034+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_005	科技宅男阿傑	JAY005	jay@techreview.tw	0956-789-012	0.1500	approved	\N	\N	\N	{"platform": "YouTube", "followers": "100K+", "specialty": "3C科技"}	0	0.00	0.00	\N	\N	https://jay-tech.com	JAY005	https://timsfantasyworld.com?ref=JAYTECH2025	2025-08-09 13:59:00.730034+08	2025-08-09 13:59:00.730034+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_1754975784609	完整測試夥伴C	完整測試003	duplicate_test_2_1754975784535@example.com	\N	0.0500	pending	\N	\N	\N	\N	0	0.00	0.00	\N	$2b$10$VqvVUSC1AmPf3/3wzDHEHO8fVnZQtwgE1Q4qKkSmeqwD6gVrCRFIC	\N	完整測試003	https://timsfantasyworld.com?ref=完整測試003	2025-08-12 13:16:24.609+08	2025-08-12 13:16:24.609+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_1754976068246	介面測試夥伴	介面測試2025	interface_test_1754976067908@example.com	\N	0.0500	pending	\N	\N	\N	\N	0	0.00	0.00	\N	$2b$10$kZhBwmlPmQbB3.e0B1o7EuJV52fOjqM381O1HaDTX7pJmqCULGj.2	\N	介面測試2025	https://timsfantasyworld.com?ref=介面測試2025	2025-08-12 13:21:08.246+08	2025-08-12 13:21:08.246+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_1754976167266	全面檢查測試	全面檢查2025	interface_check_1754976167130@example.com	\N	0.0500	pending	\N	\N	\N	\N	0	0.00	0.00	\N	$2b$10$ZLX73osrptS/Z0CJdBEiSegxSye.ZdOZhz7EuzA4NW1Qu.UUwoMH6	\N	全面檢查2025	https://timsfantasyworld.com?ref=全面檢查2025	2025-08-12 13:22:47.266+08	2025-08-12 13:22:47.266+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_1754976277351	全面檢查測試	全面檢查001	interface_check_1754976277242@example.com	\N	0.0500	pending	\N	\N	\N	\N	0	0.00	0.00	\N	$2b$10$BwUjsdN2pKTA8pb73BH88ufhZ8sssG1c2mgwuZ9MdkDZQfspp8o.6	\N	全面檢查001	https://timsfantasyworld.com?ref=全面檢查001	2025-08-12 13:24:37.352+08	2025-08-12 13:24:37.352+08	\N	\N	\N	\N	\N	\N	\N	\N	0
aff_001	小明的購物分享 (已更新)	MING001	ming@example.com	0987654321	0.0800	approved	\N	\N	\N	{"platform": "Instagram", "followers": "10K+", "specialty": "時尚穿搭"}	0	0.00	0.00	\N	$2b$10$qaOJ/VmUEEJrYPgDbNQoVO0rjBOjQz3sGaOU9AWKCUU1QON8CZ4aK	https://updated-website.com	MING2025	https://timsfantasyworld.com?ref=MING2025	2025-08-09 13:59:00.730034+08	2025-08-12 15:13:11.482+08	\N	更新的社群媒體	更新的地址	測試帳戶名稱	822	1234567890123	12345678	\N	1
\.


--
-- TOC entry 5362 (class 0 OID 162723)
-- Dependencies: 259
-- Data for Name: api_key; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.api_key (id, token, salt, redacted, title, type, last_used_at, created_by, created_at, revoked_by, revoked_at, updated_at, deleted_at) FROM stdin;
01J5C2Q0WNQJ8XRQHF8X8XQHF8	pk_12345678901234567890123456789012	salt12345	pk_12345678****	Default Publishable Key	publishable	\N	admin	2025-08-08 21:06:14.551372+08	\N	\N	2025-08-08 21:06:14.551372+08	\N
apk_01K24WV2J2Q6CK7TWTFH58R5GF	pk_c515040dd6eb6cb48cbd1bcb052035f8a1c76bc229245392f0e2692b297070af		pk_c51***0af	Webshop	publishable	\N		2025-08-08 21:10:05.634+08	\N	\N	2025-08-08 21:10:05.634+08	\N
\.


--
-- TOC entry 5344 (class 0 OID 162258)
-- Dependencies: 241
-- Data for Name: application_method_buy_rules; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.application_method_buy_rules (application_method_id, promotion_rule_id) FROM stdin;
\.


--
-- TOC entry 5343 (class 0 OID 162251)
-- Dependencies: 240
-- Data for Name: application_method_target_rules; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.application_method_target_rules (application_method_id, promotion_rule_id) FROM stdin;
\.


--
-- TOC entry 5407 (class 0 OID 163510)
-- Dependencies: 304
-- Data for Name: auth_identity; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.auth_identity (id, app_metadata, created_at, updated_at, deleted_at) FROM stdin;
authid_01K24WHT4NC87YWMVAQQRBR8SC	{"user_id": "user_01K24WHT24MB62AGNCME64PECF"}	2025-08-08 21:05:02.101+08	2025-08-08 21:05:02.116+08	\N
authid_01K24YD44JTM6NFGZ8G2XD1EFT	{"user_id": "user_01K24YD428EYCE6EN4WWC0PZAJ"}	2025-08-08 21:37:25.65+08	2025-08-08 21:37:25.657+08	\N
authid_01K25V91KQKZ78YZN2M33MFCT2	\N	2025-08-09 06:02:00.696+08	2025-08-09 06:02:00.696+08	\N
\.


--
-- TOC entry 5376 (class 0 OID 162916)
-- Dependencies: 273
-- Data for Name: capture; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.capture (id, amount, raw_amount, payment_id, created_at, updated_at, deleted_at, created_by, metadata) FROM stdin;
\.


--
-- TOC entry 5351 (class 0 OID 162476)
-- Dependencies: 248
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.cart (id, region_id, customer_id, sales_channel_id, email, currency_code, shipping_address_id, billing_address_id, metadata, created_at, updated_at, deleted_at, completed_at) FROM stdin;
cart_01K24Y8BG2E4911WMVHQGP8N33	reg_01K24X0RS9F2Q0HE4AK13HCP33	cus_01K24Y8Q786RW645XVMM372Q4F	sc_01K24WHT1DTGX58A570V7ZKBFQ	bboy10121988@gmail.com	twd	caaddr_01K24Y8Q7WKTT0YMD4RFXQDXTY	caaddr_01K24Y8Q7WJD13FJSXSQ4NMVSA	\N	2025-08-08 21:34:49.348+08	2025-08-08 21:35:01.373+08	\N	\N
\.


--
-- TOC entry 5352 (class 0 OID 162491)
-- Dependencies: 249
-- Data for Name: cart_address; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.cart_address (id, customer_id, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
caaddr_01K24Y8BG2YFHETGNWEEC0CRK3	\N	\N	\N	\N	\N	\N	\N	tw	\N	\N	\N	\N	2025-08-08 21:34:49.348+08	2025-08-08 21:34:49.348+08	\N
caaddr_01K24Y8Q7WJD13FJSXSQ4NMVSA	\N		Ray	chou	6F., No. 14, Ln. 89, Lujiang St., Luzhou Dist., New Taipei City 247007, Taiwan (R.O.C.)		New Taipei City	tw	None (International)	247007	+886983344735	\N	2025-08-08 21:35:01.373+08	2025-08-08 21:35:01.373+08	\N
caaddr_01K24Y8Q7WKTT0YMD4RFXQDXTY	\N		Ray	chou	6F., No. 14, Ln. 89, Lujiang St., Luzhou Dist., New Taipei City 247007, Taiwan (R.O.C.)		New Taipei City	tw	None (International)	247007	+886983344735	\N	2025-08-08 21:35:01.373+08	2025-08-08 21:35:01.373+08	\N
\.


--
-- TOC entry 5353 (class 0 OID 162500)
-- Dependencies: 250
-- Data for Name: cart_line_item; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.cart_line_item (id, cart_id, title, subtitle, thumbnail, quantity, variant_id, product_id, product_title, product_description, product_subtitle, product_type, product_collection, product_handle, variant_sku, variant_barcode, variant_title, variant_option_values, requires_shipping, is_discountable, is_tax_inclusive, compare_at_unit_price, raw_compare_at_unit_price, unit_price, raw_unit_price, metadata, created_at, updated_at, deleted_at, product_type_id, is_custom_price, is_giftcard) FROM stdin;
cali_01K24Y8BQ2PTX1ZGT047V7D31V	cart_01K24Y8BG2E4911WMVHQGP8N33	Medusa Sweatshirt	M	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	1	variant_01K24WV2MYMD3AHRJHXEG6T69D	prod_01K24WV2JXVKQCRK39EB3636HA	Medusa Sweatshirt	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	\N	\N	\N	sweatshirt	SWEATSHIRT-M	\N	M	\N	t	t	f	\N	\N	480	{"value": "480", "precision": 20}	{}	2025-08-08 21:34:49.57+08	2025-08-08 21:34:49.57+08	\N	\N	f	f
\.


--
-- TOC entry 5354 (class 0 OID 162526)
-- Dependencies: 251
-- Data for Name: cart_line_item_adjustment; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.cart_line_item_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, metadata, created_at, updated_at, deleted_at, item_id, is_tax_inclusive) FROM stdin;
\.


--
-- TOC entry 5355 (class 0 OID 162538)
-- Dependencies: 252
-- Data for Name: cart_line_item_tax_line; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.cart_line_item_tax_line (id, description, tax_rate_id, code, rate, provider_id, metadata, created_at, updated_at, deleted_at, item_id) FROM stdin;
\.


--
-- TOC entry 5444 (class 0 OID 164033)
-- Dependencies: 341
-- Data for Name: cart_payment_collection; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.cart_payment_collection (cart_id, payment_collection_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5431 (class 0 OID 163878)
-- Dependencies: 328
-- Data for Name: cart_promotion; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.cart_promotion (cart_id, promotion_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5356 (class 0 OID 162549)
-- Dependencies: 253
-- Data for Name: cart_shipping_method; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.cart_shipping_method (id, cart_id, name, description, amount, raw_amount, is_tax_inclusive, shipping_option_id, data, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5357 (class 0 OID 162562)
-- Dependencies: 254
-- Data for Name: cart_shipping_method_adjustment; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.cart_shipping_method_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, metadata, created_at, updated_at, deleted_at, shipping_method_id) FROM stdin;
\.


--
-- TOC entry 5358 (class 0 OID 162573)
-- Dependencies: 255
-- Data for Name: cart_shipping_method_tax_line; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.cart_shipping_method_tax_line (id, description, tax_rate_id, code, rate, provider_id, metadata, created_at, updated_at, deleted_at, shipping_method_id) FROM stdin;
\.


--
-- TOC entry 5359 (class 0 OID 162676)
-- Dependencies: 256
-- Data for Name: credit_line; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.credit_line (id, cart_id, reference, reference_id, amount, raw_amount, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5369 (class 0 OID 162841)
-- Dependencies: 266
-- Data for Name: currency; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.currency (code, symbol, symbol_native, decimal_digits, rounding, raw_rounding, name, created_at, updated_at, deleted_at) FROM stdin;
usd	$	$	2	0	{"value": "0", "precision": 20}	US Dollar	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
cad	CA$	$	2	0	{"value": "0", "precision": 20}	Canadian Dollar	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
eur	€	€	2	0	{"value": "0", "precision": 20}	Euro	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
aed	AED	د.إ.‏	2	0	{"value": "0", "precision": 20}	United Arab Emirates Dirham	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
afn	Af	؋	0	0	{"value": "0", "precision": 20}	Afghan Afghani	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
all	ALL	Lek	0	0	{"value": "0", "precision": 20}	Albanian Lek	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
amd	AMD	դր.	0	0	{"value": "0", "precision": 20}	Armenian Dram	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
ars	AR$	$	2	0	{"value": "0", "precision": 20}	Argentine Peso	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
aud	AU$	$	2	0	{"value": "0", "precision": 20}	Australian Dollar	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
azn	man.	ман.	2	0	{"value": "0", "precision": 20}	Azerbaijani Manat	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
bam	KM	KM	2	0	{"value": "0", "precision": 20}	Bosnia-Herzegovina Convertible Mark	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
bdt	Tk	৳	2	0	{"value": "0", "precision": 20}	Bangladeshi Taka	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
bgn	BGN	лв.	2	0	{"value": "0", "precision": 20}	Bulgarian Lev	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
bhd	BD	د.ب.‏	3	0	{"value": "0", "precision": 20}	Bahraini Dinar	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
bif	FBu	FBu	0	0	{"value": "0", "precision": 20}	Burundian Franc	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
bnd	BN$	$	2	0	{"value": "0", "precision": 20}	Brunei Dollar	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
bob	Bs	Bs	2	0	{"value": "0", "precision": 20}	Bolivian Boliviano	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
brl	R$	R$	2	0	{"value": "0", "precision": 20}	Brazilian Real	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
bwp	BWP	P	2	0	{"value": "0", "precision": 20}	Botswanan Pula	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
byn	Br	руб.	2	0	{"value": "0", "precision": 20}	Belarusian Ruble	2025-08-08 21:04:42.339+08	2025-08-08 21:04:42.339+08	\N
bzd	BZ$	$	2	0	{"value": "0", "precision": 20}	Belize Dollar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
cdf	CDF	FrCD	2	0	{"value": "0", "precision": 20}	Congolese Franc	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
chf	CHF	CHF	2	0.05	{"value": "0.05", "precision": 20}	Swiss Franc	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
clp	CL$	$	0	0	{"value": "0", "precision": 20}	Chilean Peso	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
cny	CN¥	CN¥	2	0	{"value": "0", "precision": 20}	Chinese Yuan	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
cop	CO$	$	0	0	{"value": "0", "precision": 20}	Colombian Peso	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
crc	₡	₡	0	0	{"value": "0", "precision": 20}	Costa Rican Colón	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
cve	CV$	CV$	2	0	{"value": "0", "precision": 20}	Cape Verdean Escudo	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
czk	Kč	Kč	2	0	{"value": "0", "precision": 20}	Czech Republic Koruna	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
djf	Fdj	Fdj	0	0	{"value": "0", "precision": 20}	Djiboutian Franc	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
dkk	Dkr	kr	2	0	{"value": "0", "precision": 20}	Danish Krone	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
dop	RD$	RD$	2	0	{"value": "0", "precision": 20}	Dominican Peso	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
dzd	DA	د.ج.‏	2	0	{"value": "0", "precision": 20}	Algerian Dinar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
eek	Ekr	kr	2	0	{"value": "0", "precision": 20}	Estonian Kroon	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
egp	EGP	ج.م.‏	2	0	{"value": "0", "precision": 20}	Egyptian Pound	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
ern	Nfk	Nfk	2	0	{"value": "0", "precision": 20}	Eritrean Nakfa	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
etb	Br	Br	2	0	{"value": "0", "precision": 20}	Ethiopian Birr	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
gbp	£	£	2	0	{"value": "0", "precision": 20}	British Pound Sterling	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
gel	GEL	GEL	2	0	{"value": "0", "precision": 20}	Georgian Lari	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
ghs	GH₵	GH₵	2	0	{"value": "0", "precision": 20}	Ghanaian Cedi	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
gnf	FG	FG	0	0	{"value": "0", "precision": 20}	Guinean Franc	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
gtq	GTQ	Q	2	0	{"value": "0", "precision": 20}	Guatemalan Quetzal	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
hkd	HK$	$	2	0	{"value": "0", "precision": 20}	Hong Kong Dollar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
hnl	HNL	L	2	0	{"value": "0", "precision": 20}	Honduran Lempira	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
hrk	kn	kn	2	0	{"value": "0", "precision": 20}	Croatian Kuna	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
huf	Ft	Ft	0	0	{"value": "0", "precision": 20}	Hungarian Forint	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
idr	Rp	Rp	0	0	{"value": "0", "precision": 20}	Indonesian Rupiah	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
ils	₪	₪	2	0	{"value": "0", "precision": 20}	Israeli New Sheqel	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
inr	Rs	₹	2	0	{"value": "0", "precision": 20}	Indian Rupee	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
iqd	IQD	د.ع.‏	0	0	{"value": "0", "precision": 20}	Iraqi Dinar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
irr	IRR	﷼	0	0	{"value": "0", "precision": 20}	Iranian Rial	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
isk	Ikr	kr	0	0	{"value": "0", "precision": 20}	Icelandic Króna	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
jmd	J$	$	2	0	{"value": "0", "precision": 20}	Jamaican Dollar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
jod	JD	د.أ.‏	3	0	{"value": "0", "precision": 20}	Jordanian Dinar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
jpy	¥	￥	0	0	{"value": "0", "precision": 20}	Japanese Yen	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
kes	Ksh	Ksh	2	0	{"value": "0", "precision": 20}	Kenyan Shilling	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
khr	KHR	៛	2	0	{"value": "0", "precision": 20}	Cambodian Riel	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
kmf	CF	FC	0	0	{"value": "0", "precision": 20}	Comorian Franc	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
krw	₩	₩	0	0	{"value": "0", "precision": 20}	South Korean Won	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
kwd	KD	د.ك.‏	3	0	{"value": "0", "precision": 20}	Kuwaiti Dinar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
kzt	KZT	тңг.	2	0	{"value": "0", "precision": 20}	Kazakhstani Tenge	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
lbp	LB£	ل.ل.‏	0	0	{"value": "0", "precision": 20}	Lebanese Pound	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
lkr	SLRs	SL Re	2	0	{"value": "0", "precision": 20}	Sri Lankan Rupee	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
ltl	Lt	Lt	2	0	{"value": "0", "precision": 20}	Lithuanian Litas	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
lvl	Ls	Ls	2	0	{"value": "0", "precision": 20}	Latvian Lats	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
lyd	LD	د.ل.‏	3	0	{"value": "0", "precision": 20}	Libyan Dinar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
mad	MAD	د.م.‏	2	0	{"value": "0", "precision": 20}	Moroccan Dirham	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
mdl	MDL	MDL	2	0	{"value": "0", "precision": 20}	Moldovan Leu	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
mga	MGA	MGA	0	0	{"value": "0", "precision": 20}	Malagasy Ariary	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
mkd	MKD	MKD	2	0	{"value": "0", "precision": 20}	Macedonian Denar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
mmk	MMK	K	0	0	{"value": "0", "precision": 20}	Myanma Kyat	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
mnt	MNT	₮	0	0	{"value": "0", "precision": 20}	Mongolian Tugrig	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
mop	MOP$	MOP$	2	0	{"value": "0", "precision": 20}	Macanese Pataca	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
mur	MURs	MURs	0	0	{"value": "0", "precision": 20}	Mauritian Rupee	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
mwk	K	K	2	0	{"value": "0", "precision": 20}	Malawian Kwacha	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
mxn	MX$	$	2	0	{"value": "0", "precision": 20}	Mexican Peso	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
myr	RM	RM	2	0	{"value": "0", "precision": 20}	Malaysian Ringgit	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
mzn	MTn	MTn	2	0	{"value": "0", "precision": 20}	Mozambican Metical	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
nad	N$	N$	2	0	{"value": "0", "precision": 20}	Namibian Dollar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
ngn	₦	₦	2	0	{"value": "0", "precision": 20}	Nigerian Naira	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
nio	C$	C$	2	0	{"value": "0", "precision": 20}	Nicaraguan Córdoba	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
nok	Nkr	kr	2	0	{"value": "0", "precision": 20}	Norwegian Krone	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
npr	NPRs	नेरू	2	0	{"value": "0", "precision": 20}	Nepalese Rupee	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
nzd	NZ$	$	2	0	{"value": "0", "precision": 20}	New Zealand Dollar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
omr	OMR	ر.ع.‏	3	0	{"value": "0", "precision": 20}	Omani Rial	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
pab	B/.	B/.	2	0	{"value": "0", "precision": 20}	Panamanian Balboa	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
pen	S/.	S/.	2	0	{"value": "0", "precision": 20}	Peruvian Nuevo Sol	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
php	₱	₱	2	0	{"value": "0", "precision": 20}	Philippine Peso	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
pkr	PKRs	₨	0	0	{"value": "0", "precision": 20}	Pakistani Rupee	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
pln	zł	zł	2	0	{"value": "0", "precision": 20}	Polish Zloty	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
pyg	₲	₲	0	0	{"value": "0", "precision": 20}	Paraguayan Guarani	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
qar	QR	ر.ق.‏	2	0	{"value": "0", "precision": 20}	Qatari Rial	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
ron	RON	RON	2	0	{"value": "0", "precision": 20}	Romanian Leu	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
rsd	din.	дин.	0	0	{"value": "0", "precision": 20}	Serbian Dinar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
rub	RUB	₽.	2	0	{"value": "0", "precision": 20}	Russian Ruble	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
rwf	RWF	FR	0	0	{"value": "0", "precision": 20}	Rwandan Franc	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
sar	SR	ر.س.‏	2	0	{"value": "0", "precision": 20}	Saudi Riyal	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
sdg	SDG	SDG	2	0	{"value": "0", "precision": 20}	Sudanese Pound	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
sek	Skr	kr	2	0	{"value": "0", "precision": 20}	Swedish Krona	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
sgd	S$	$	2	0	{"value": "0", "precision": 20}	Singapore Dollar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
sos	Ssh	Ssh	0	0	{"value": "0", "precision": 20}	Somali Shilling	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
syp	SY£	ل.س.‏	0	0	{"value": "0", "precision": 20}	Syrian Pound	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
thb	฿	฿	2	0	{"value": "0", "precision": 20}	Thai Baht	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
tnd	DT	د.ت.‏	3	0	{"value": "0", "precision": 20}	Tunisian Dinar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
top	T$	T$	2	0	{"value": "0", "precision": 20}	Tongan Paʻanga	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
try	₺	₺	2	0	{"value": "0", "precision": 20}	Turkish Lira	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
ttd	TT$	$	2	0	{"value": "0", "precision": 20}	Trinidad and Tobago Dollar	2025-08-08 21:04:42.34+08	2025-08-08 21:04:42.34+08	\N
twd	NT$	NT$	2	0	{"value": "0", "precision": 20}	New Taiwan Dollar	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
tzs	TSh	TSh	0	0	{"value": "0", "precision": 20}	Tanzanian Shilling	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
uah	₴	₴	2	0	{"value": "0", "precision": 20}	Ukrainian Hryvnia	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
ugx	USh	USh	0	0	{"value": "0", "precision": 20}	Ugandan Shilling	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
uyu	$U	$	2	0	{"value": "0", "precision": 20}	Uruguayan Peso	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
uzs	UZS	UZS	0	0	{"value": "0", "precision": 20}	Uzbekistan Som	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
vef	Bs.F.	Bs.F.	2	0	{"value": "0", "precision": 20}	Venezuelan Bolívar	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
vnd	₫	₫	0	0	{"value": "0", "precision": 20}	Vietnamese Dong	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
xaf	FCFA	FCFA	0	0	{"value": "0", "precision": 20}	CFA Franc BEAC	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
xof	CFA	CFA	0	0	{"value": "0", "precision": 20}	CFA Franc BCEAO	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
yer	YR	ر.ي.‏	0	0	{"value": "0", "precision": 20}	Yemeni Rial	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
zar	R	R	2	0	{"value": "0", "precision": 20}	South African Rand	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
zmk	ZK	ZK	0	0	{"value": "0", "precision": 20}	Zambian Kwacha	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
zwl	ZWL$	ZWL$	0	0	{"value": "0", "precision": 20}	Zimbabwean Dollar	2025-08-08 21:04:42.341+08	2025-08-08 21:04:42.341+08	\N
\.


--
-- TOC entry 5346 (class 0 OID 162388)
-- Dependencies: 243
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.customer (id, company_name, first_name, last_name, email, phone, has_account, metadata, created_at, updated_at, deleted_at, created_by) FROM stdin;
cus_01K24Y8Q786RW645XVMM372Q4F	\N	\N	\N	bboy10121988@gmail.com	\N	f	\N	2025-08-08 21:35:01.353+08	2025-08-08 21:35:01.353+08	\N	\N
\.


--
-- TOC entry 5443 (class 0 OID 164031)
-- Dependencies: 340
-- Data for Name: customer_account_holder; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.customer_account_holder (customer_id, account_holder_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5347 (class 0 OID 162398)
-- Dependencies: 244
-- Data for Name: customer_address; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.customer_address (id, customer_id, address_name, is_default_shipping, is_default_billing, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5348 (class 0 OID 162412)
-- Dependencies: 245
-- Data for Name: customer_group; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.customer_group (id, name, metadata, created_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5349 (class 0 OID 162422)
-- Dependencies: 246
-- Data for Name: customer_group_customer; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.customer_group_customer (id, customer_id, customer_group_id, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- TOC entry 5420 (class 0 OID 163674)
-- Dependencies: 317
-- Data for Name: fulfillment; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.fulfillment (id, location_id, packed_at, shipped_at, delivered_at, canceled_at, data, provider_id, shipping_option_id, metadata, delivery_address_id, created_at, updated_at, deleted_at, marked_shipped_by, created_by, requires_shipping) FROM stdin;
\.


--
-- TOC entry 5411 (class 0 OID 163566)
-- Dependencies: 308
-- Data for Name: fulfillment_address; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.fulfillment_address (id, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5422 (class 0 OID 163700)
-- Dependencies: 319
-- Data for Name: fulfillment_item; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.fulfillment_item (id, title, sku, barcode, quantity, raw_quantity, line_item_id, inventory_item_id, fulfillment_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5421 (class 0 OID 163689)
-- Dependencies: 318
-- Data for Name: fulfillment_label; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.fulfillment_label (id, tracking_number, tracking_url, label_url, fulfillment_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5412 (class 0 OID 163576)
-- Dependencies: 309
-- Data for Name: fulfillment_provider; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.fulfillment_provider (id, is_enabled, created_at, updated_at, deleted_at) FROM stdin;
manual_manual	t	2025-08-08 21:04:42.363+08	2025-08-08 21:04:42.363+08	\N
\.


--
-- TOC entry 5413 (class 0 OID 163584)
-- Dependencies: 310
-- Data for Name: fulfillment_set; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.fulfillment_set (id, name, type, metadata, created_at, updated_at, deleted_at) FROM stdin;
fuset_01K24WV2F70B6YHNZ3R5WZ52SR	European Warehouse delivery	shipping	\N	2025-08-08 21:10:05.543+08	2025-08-08 21:10:05.543+08	\N
\.


--
-- TOC entry 5415 (class 0 OID 163607)
-- Dependencies: 312
-- Data for Name: geo_zone; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.geo_zone (id, type, country_code, province_code, city, service_zone_id, postal_expression, metadata, created_at, updated_at, deleted_at) FROM stdin;
fgz_01K24WV2F7J07H65SN350F980C	country	gb	\N	\N	serzo_01K24WV2F75SJWNTDH85CK7PXD	\N	\N	2025-08-08 21:10:05.543+08	2025-08-08 21:10:05.543+08	\N
fgz_01K24WV2F7025HYYMAKSR4KS77	country	de	\N	\N	serzo_01K24WV2F75SJWNTDH85CK7PXD	\N	\N	2025-08-08 21:10:05.544+08	2025-08-08 21:10:05.544+08	\N
fgz_01K24WV2F7XME0JRB83Z7ZW381	country	dk	\N	\N	serzo_01K24WV2F75SJWNTDH85CK7PXD	\N	\N	2025-08-08 21:10:05.544+08	2025-08-08 21:10:05.544+08	\N
fgz_01K24WV2F7N2D70KWAGGZ6GV0Z	country	se	\N	\N	serzo_01K24WV2F75SJWNTDH85CK7PXD	\N	\N	2025-08-08 21:10:05.544+08	2025-08-08 21:10:05.544+08	\N
fgz_01K24WV2F7AZY1T5BVF8N90723	country	fr	\N	\N	serzo_01K24WV2F75SJWNTDH85CK7PXD	\N	\N	2025-08-08 21:10:05.544+08	2025-08-08 21:10:05.544+08	\N
fgz_01K24WV2F7QKM2ZH8F07RA10NT	country	es	\N	\N	serzo_01K24WV2F75SJWNTDH85CK7PXD	\N	\N	2025-08-08 21:10:05.544+08	2025-08-08 21:10:05.544+08	\N
fgz_01K24WV2F7HAVPRK4P70X2YMJQ	country	it	\N	\N	serzo_01K24WV2F75SJWNTDH85CK7PXD	\N	\N	2025-08-08 21:10:05.544+08	2025-08-08 21:10:05.544+08	\N
\.


--
-- TOC entry 5323 (class 0 OID 161685)
-- Dependencies: 220
-- Data for Name: image; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.image (id, url, metadata, created_at, updated_at, deleted_at, rank, product_id) FROM stdin;
img_01K24WV2JY67QJ8Z1349N0FWHN	https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N	0	prod_01K24WV2JXXDK8XDNKS68JVDVW
img_01K24WV2JY6S99N8M9H4M8GEWH	https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-back.png	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N	1	prod_01K24WV2JXXDK8XDNKS68JVDVW
img_01K24WV2JYAHWE2S0XYVSCXZSK	https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N	2	prod_01K24WV2JXXDK8XDNKS68JVDVW
img_01K24WV2JY56331R3GBTYX8FBB	https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N	3	prod_01K24WV2JXXDK8XDNKS68JVDVW
img_01K24WV2JZQJMRG9MZX78J7WNC	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N	0	prod_01K24WV2JXVKQCRK39EB3636HA
img_01K24WV2JZC0F969Q9AZGKVCBE	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N	1	prod_01K24WV2JXVKQCRK39EB3636HA
img_01K24WV2JZ84J7C26HC44PZTHC	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N	0	prod_01K24WV2JXFKJEQ0A7TBMPNCP3
img_01K24WV2JZ0CJZ2W898PK5FGDT	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N	1	prod_01K24WV2JXFKJEQ0A7TBMPNCP3
img_01K24WV2K05837Y53TQBETGJ36	https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N	0	prod_01K24WV2JX0JRSGMFRQ6J3J2JM
img_01K24WV2K0NCVTEW55FPWTFD1P	https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N	1	prod_01K24WV2JX0JRSGMFRQ6J3J2JM
\.


--
-- TOC entry 5316 (class 0 OID 161526)
-- Dependencies: 213
-- Data for Name: inventory_item; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.inventory_item (id, created_at, updated_at, deleted_at, sku, origin_country, hs_code, mid_code, material, weight, length, height, width, requires_shipping, description, title, thumbnail, metadata) FROM stdin;
iitem_01K24WV2NHGFW9BCSTC847B6XH	2025-08-08 21:10:05.746+08	2025-08-08 21:10:05.746+08	\N	SHIRT-S-BLACK	\N	\N	\N	\N	\N	\N	\N	\N	t	S / Black	S / Black	\N	\N
iitem_01K24WV2NJWA577YS23M3W2K4B	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SHIRT-S-WHITE	\N	\N	\N	\N	\N	\N	\N	\N	t	S / White	S / White	\N	\N
iitem_01K24WV2NJNH32M3VKYMM7RM2A	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SHIRT-M-BLACK	\N	\N	\N	\N	\N	\N	\N	\N	t	M / Black	M / Black	\N	\N
iitem_01K24WV2NJXGK3JCZ0R1JFNKMR	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SHIRT-M-WHITE	\N	\N	\N	\N	\N	\N	\N	\N	t	M / White	M / White	\N	\N
iitem_01K24WV2NJDHT97XPJHWN606JB	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SHIRT-L-BLACK	\N	\N	\N	\N	\N	\N	\N	\N	t	L / Black	L / Black	\N	\N
iitem_01K24WV2NJ3TFAW2CAQQ1HS5D8	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SHIRT-L-WHITE	\N	\N	\N	\N	\N	\N	\N	\N	t	L / White	L / White	\N	\N
iitem_01K24WV2NJ00TAMH29K10Q5F33	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SHIRT-XL-BLACK	\N	\N	\N	\N	\N	\N	\N	\N	t	XL / Black	XL / Black	\N	\N
iitem_01K24WV2NJXFJ94NNKBPV55MKT	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SHIRT-XL-WHITE	\N	\N	\N	\N	\N	\N	\N	\N	t	XL / White	XL / White	\N	\N
iitem_01K24WV2NJAT9GWHKG7HHH5THK	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SWEATSHIRT-S	\N	\N	\N	\N	\N	\N	\N	\N	t	S	S	\N	\N
iitem_01K24WV2NJZ915NF5V809RCK1S	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SWEATSHIRT-M	\N	\N	\N	\N	\N	\N	\N	\N	t	M	M	\N	\N
iitem_01K24WV2NJ0SPEZ8MA50X0Z5A1	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SWEATSHIRT-L	\N	\N	\N	\N	\N	\N	\N	\N	t	L	L	\N	\N
iitem_01K24WV2NJQSSV6T04EJH5BNSY	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SWEATSHIRT-XL	\N	\N	\N	\N	\N	\N	\N	\N	t	XL	XL	\N	\N
iitem_01K24WV2NJQ9JSATF0EX81E8ZC	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SWEATPANTS-S	\N	\N	\N	\N	\N	\N	\N	\N	t	S	S	\N	\N
iitem_01K24WV2NJC8K6QSCXP9PBZSVX	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SWEATPANTS-M	\N	\N	\N	\N	\N	\N	\N	\N	t	M	M	\N	\N
iitem_01K24WV2NJFCSYJP68EE9BZTQX	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SWEATPANTS-L	\N	\N	\N	\N	\N	\N	\N	\N	t	L	L	\N	\N
iitem_01K24WV2NJAV1A8HS38AQ2BBVF	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SWEATPANTS-XL	\N	\N	\N	\N	\N	\N	\N	\N	t	XL	XL	\N	\N
iitem_01K24WV2NJXMX1G59HFB9GFEEQ	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SHORTS-S	\N	\N	\N	\N	\N	\N	\N	\N	t	S	S	\N	\N
iitem_01K24WV2NJ5F4NK91WEJPC4Y85	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SHORTS-M	\N	\N	\N	\N	\N	\N	\N	\N	t	M	M	\N	\N
iitem_01K24WV2NJTAWXN5QQGKJT06YH	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SHORTS-L	\N	\N	\N	\N	\N	\N	\N	\N	t	L	L	\N	\N
iitem_01K24WV2NJ4EE7X4SQVZRV36GR	2025-08-08 21:10:05.747+08	2025-08-08 21:10:05.747+08	\N	SHORTS-XL	\N	\N	\N	\N	\N	\N	\N	\N	t	XL	XL	\N	\N
\.


--
-- TOC entry 5317 (class 0 OID 161538)
-- Dependencies: 214
-- Data for Name: inventory_level; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.inventory_level (id, created_at, updated_at, deleted_at, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, metadata, raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity) FROM stdin;
ilev_01K24WV2R40RFDFXPKMA22C6QH	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NHGFW9BCSTC847B6XH	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R43GBDZJ7738FTTP0G	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJ00TAMH29K10Q5F33	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R4TZ0DJZKWHR9S960J	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJ0SPEZ8MA50X0Z5A1	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R48ZCVTY6D3VT68RMY	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJ3TFAW2CAQQ1HS5D8	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R4AC36828ZAKRZSBP9	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJ4EE7X4SQVZRV36GR	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R4X94ACTV7GF1V6TFD	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJ5F4NK91WEJPC4Y85	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R4R0C59VCQMQRWD81R	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJAT9GWHKG7HHH5THK	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R4XM2ZEBVCGVMVPR5V	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJAV1A8HS38AQ2BBVF	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R5CA1F8XEXT20QX4KG	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJC8K6QSCXP9PBZSVX	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R5WW7MZKS8HYCJX9FX	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJDHT97XPJHWN606JB	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R5DP7VYVBD7G2X7RWT	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJFCSYJP68EE9BZTQX	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R5SA99A0A48CB0W0SY	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJNH32M3VKYMM7RM2A	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R53F9MTJJ2MJ7VB8GS	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJQ9JSATF0EX81E8ZC	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R5YZBVN5QTADWBCBMD	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJQSSV6T04EJH5BNSY	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R53SBH8HZDKJG0AAQE	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJTAWXN5QQGKJT06YH	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R514ZKSW0YQNHA9GB1	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJWA577YS23M3W2K4B	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R5DG489ENKPN5PY0JY	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJXFJ94NNKBPV55MKT	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R528MW99PWCSVCA32D	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJXGK3JCZ0R1JFNKMR	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R51TGS7W4K42HZAWZE	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJXMX1G59HFB9GFEEQ	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
ilev_01K24WV2R55J9CNT92JME81CWH	2025-08-08 21:10:05.829+08	2025-08-08 21:10:05.829+08	\N	iitem_01K24WV2NJZ915NF5V809RCK1S	sloc_01K24WV2ER5W9N9RV442CVJ8GB	1000000	0	0	\N	{"value": "1000000", "precision": 20}	{"value": "0", "precision": 20}	{"value": "0", "precision": 20}
\.


--
-- TOC entry 5409 (class 0 OID 163539)
-- Dependencies: 306
-- Data for Name: invite; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.invite (id, email, accepted, token, expires_at, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5427 (class 0 OID 163857)
-- Dependencies: 324
-- Data for Name: link_module_migrations; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.link_module_migrations (id, table_name, link_descriptor, created_at) FROM stdin;
2	location_fulfillment_set	{"toModel": "fulfillment_set", "toModule": "fulfillment", "fromModel": "location", "fromModule": "stock_location"}	2025-08-08 21:04:40.575558
1	cart_promotion	{"toModel": "promotions", "toModule": "promotion", "fromModel": "cart", "fromModule": "cart"}	2025-08-08 21:04:40.575134
4	order_cart	{"toModel": "cart", "toModule": "cart", "fromModel": "order", "fromModule": "order"}	2025-08-08 21:04:40.575941
3	location_fulfillment_provider	{"toModel": "fulfillment_provider", "toModule": "fulfillment", "fromModel": "location", "fromModule": "stock_location"}	2025-08-08 21:04:40.575337
5	order_fulfillment	{"toModel": "fulfillments", "toModule": "fulfillment", "fromModel": "order", "fromModule": "order"}	2025-08-08 21:04:40.57651
6	order_payment_collection	{"toModel": "payment_collection", "toModule": "payment", "fromModel": "order", "fromModule": "order"}	2025-08-08 21:04:40.576523
7	order_promotion	{"toModel": "promotions", "toModule": "promotion", "fromModel": "order", "fromModule": "order"}	2025-08-08 21:04:40.57716
8	return_fulfillment	{"toModel": "fulfillments", "toModule": "fulfillment", "fromModel": "return", "fromModule": "order"}	2025-08-08 21:04:40.57957
9	product_variant_inventory_item	{"toModel": "inventory", "toModule": "inventory", "fromModel": "variant", "fromModule": "product"}	2025-08-08 21:04:40.58006
10	product_sales_channel	{"toModel": "sales_channel", "toModule": "sales_channel", "fromModel": "product", "fromModule": "product"}	2025-08-08 21:04:40.58002
11	product_variant_price_set	{"toModel": "price_set", "toModule": "pricing", "fromModel": "variant", "fromModule": "product"}	2025-08-08 21:04:40.584552
12	publishable_api_key_sales_channel	{"toModel": "sales_channel", "toModule": "sales_channel", "fromModel": "api_key", "fromModule": "api_key"}	2025-08-08 21:04:40.587533
13	region_payment_provider	{"toModel": "payment_provider", "toModule": "payment", "fromModel": "region", "fromModule": "region"}	2025-08-08 21:04:40.587951
14	sales_channel_stock_location	{"toModel": "location", "toModule": "stock_location", "fromModel": "sales_channel", "fromModule": "sales_channel"}	2025-08-08 21:04:40.588004
15	shipping_option_price_set	{"toModel": "price_set", "toModule": "pricing", "fromModel": "shipping_option", "fromModule": "fulfillment"}	2025-08-08 21:04:40.588119
16	customer_account_holder	{"toModel": "account_holder", "toModule": "payment", "fromModel": "customer", "fromModule": "customer"}	2025-08-08 21:04:40.588503
17	cart_payment_collection	{"toModel": "payment_collection", "toModule": "payment", "fromModel": "cart", "fromModule": "cart"}	2025-08-08 21:04:40.58858
18	product_shipping_profile	{"toModel": "shipping_profile", "toModule": "fulfillment", "fromModel": "product", "fromModule": "product"}	2025-08-08 21:04:40.58812
\.


--
-- TOC entry 5430 (class 0 OID 163875)
-- Dependencies: 327
-- Data for Name: location_fulfillment_provider; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.location_fulfillment_provider (stock_location_id, fulfillment_provider_id, id, created_at, updated_at, deleted_at) FROM stdin;
sloc_01K24WV2ER5W9N9RV442CVJ8GB	manual_manual	locfp_01K24WV2EYRG5M8G19CS02XQX5	2025-08-08 21:10:05.534227+08	2025-08-08 21:10:05.534227+08	\N
\.


--
-- TOC entry 5428 (class 0 OID 163869)
-- Dependencies: 325
-- Data for Name: location_fulfillment_set; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.location_fulfillment_set (stock_location_id, fulfillment_set_id, id, created_at, updated_at, deleted_at) FROM stdin;
sloc_01K24WV2ER5W9N9RV442CVJ8GB	fuset_01K24WV2F70B6YHNZ3R5WZ52SR	locfs_01K24WV2FRTM7MNGY2MZQ5VHCW	2025-08-08 21:10:05.560789+08	2025-08-08 21:10:05.560789+08	\N
\.


--
-- TOC entry 5313 (class 0 OID 161485)
-- Dependencies: 210
-- Data for Name: mikro_orm_migrations; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.mikro_orm_migrations (id, name, executed_at) FROM stdin;
1	Migration20240307161216	2025-08-08 21:04:39.446092+08
2	Migration20241210073813	2025-08-08 21:04:39.446092+08
3	Migration20250106142624	2025-08-08 21:04:39.446092+08
4	Migration20250120110820	2025-08-08 21:04:39.446092+08
5	Migration20240307132720	2025-08-08 21:04:39.550073+08
6	Migration20240719123015	2025-08-08 21:04:39.550073+08
7	Migration20241213063611	2025-08-08 21:04:39.550073+08
8	InitialSetup20240401153642	2025-08-08 21:04:39.611231+08
9	Migration20240601111544	2025-08-08 21:04:39.611231+08
10	Migration202408271511	2025-08-08 21:04:39.611231+08
11	Migration20241122120331	2025-08-08 21:04:39.611231+08
12	Migration20241125090957	2025-08-08 21:04:39.611231+08
13	Migration20250411073236	2025-08-08 21:04:39.611231+08
14	Migration20250516081326	2025-08-08 21:04:39.611231+08
15	Migration20230929122253	2025-08-08 21:04:39.687087+08
16	Migration20240322094407	2025-08-08 21:04:39.687087+08
17	Migration20240322113359	2025-08-08 21:04:39.687087+08
18	Migration20240322120125	2025-08-08 21:04:39.687087+08
19	Migration20240626133555	2025-08-08 21:04:39.687087+08
20	Migration20240704094505	2025-08-08 21:04:39.687087+08
21	Migration20241127114534	2025-08-08 21:04:39.687087+08
22	Migration20241127223829	2025-08-08 21:04:39.687087+08
23	Migration20241128055359	2025-08-08 21:04:39.687087+08
24	Migration20241212190401	2025-08-08 21:04:39.687087+08
25	Migration20250408145122	2025-08-08 21:04:39.687087+08
26	Migration20250409122219	2025-08-08 21:04:39.687087+08
27	Migration20240227120221	2025-08-08 21:04:39.770898+08
28	Migration20240617102917	2025-08-08 21:04:39.770898+08
29	Migration20240624153824	2025-08-08 21:04:39.770898+08
30	Migration20241211061114	2025-08-08 21:04:39.770898+08
31	Migration20250113094144	2025-08-08 21:04:39.770898+08
32	Migration20250120110700	2025-08-08 21:04:39.770898+08
33	Migration20250226130616	2025-08-08 21:04:39.770898+08
34	Migration20250508081510	2025-08-08 21:04:39.770898+08
35	Migration20240124154000	2025-08-08 21:04:39.823616+08
36	Migration20240524123112	2025-08-08 21:04:39.823616+08
37	Migration20240602110946	2025-08-08 21:04:39.823616+08
38	Migration20241211074630	2025-08-08 21:04:39.823616+08
39	Migration20240115152146	2025-08-08 21:04:39.851261+08
40	Migration20240222170223	2025-08-08 21:04:39.863752+08
41	Migration20240831125857	2025-08-08 21:04:39.863752+08
42	Migration20241106085918	2025-08-08 21:04:39.863752+08
43	Migration20241205095237	2025-08-08 21:04:39.863752+08
44	Migration20241216183049	2025-08-08 21:04:39.863752+08
45	Migration20241218091938	2025-08-08 21:04:39.863752+08
46	Migration20250120115059	2025-08-08 21:04:39.863752+08
47	Migration20250212131240	2025-08-08 21:04:39.863752+08
48	Migration20250326151602	2025-08-08 21:04:39.863752+08
49	Migration20250508081553	2025-08-08 21:04:39.863752+08
50	Migration20240205173216	2025-08-08 21:04:39.917315+08
51	Migration20240624200006	2025-08-08 21:04:39.917315+08
52	Migration20250120110744	2025-08-08 21:04:39.917315+08
53	InitialSetup20240221144943	2025-08-08 21:04:39.970073+08
54	Migration20240604080145	2025-08-08 21:04:39.970073+08
55	Migration20241205122700	2025-08-08 21:04:39.970073+08
56	InitialSetup20240227075933	2025-08-08 21:04:39.986473+08
57	Migration20240621145944	2025-08-08 21:04:39.986473+08
58	Migration20241206083313	2025-08-08 21:04:39.986473+08
59	Migration20240227090331	2025-08-08 21:04:40.003989+08
60	Migration20240710135844	2025-08-08 21:04:40.003989+08
61	Migration20240924114005	2025-08-08 21:04:40.003989+08
62	Migration20241212052837	2025-08-08 21:04:40.003989+08
63	InitialSetup20240228133303	2025-08-08 21:04:40.035511+08
64	Migration20240624082354	2025-08-08 21:04:40.035511+08
65	Migration20240225134525	2025-08-08 21:04:40.048359+08
66	Migration20240806072619	2025-08-08 21:04:40.048359+08
67	Migration20241211151053	2025-08-08 21:04:40.048359+08
68	Migration20250115160517	2025-08-08 21:04:40.048359+08
69	Migration20250120110552	2025-08-08 21:04:40.048359+08
70	Migration20250123122334	2025-08-08 21:04:40.048359+08
71	Migration20250206105639	2025-08-08 21:04:40.048359+08
72	Migration20250207132723	2025-08-08 21:04:40.048359+08
73	Migration20250625084134	2025-08-08 21:04:40.048359+08
74	Migration20240219102530	2025-08-08 21:04:40.095098+08
75	Migration20240604100512	2025-08-08 21:04:40.095098+08
76	Migration20240715102100	2025-08-08 21:04:40.095098+08
77	Migration20240715174100	2025-08-08 21:04:40.095098+08
78	Migration20240716081800	2025-08-08 21:04:40.095098+08
79	Migration20240801085921	2025-08-08 21:04:40.095098+08
80	Migration20240821164505	2025-08-08 21:04:40.095098+08
81	Migration20240821170920	2025-08-08 21:04:40.095098+08
82	Migration20240827133639	2025-08-08 21:04:40.095098+08
83	Migration20240902195921	2025-08-08 21:04:40.095098+08
84	Migration20240913092514	2025-08-08 21:04:40.095098+08
85	Migration20240930122627	2025-08-08 21:04:40.095098+08
86	Migration20241014142943	2025-08-08 21:04:40.095098+08
87	Migration20241106085223	2025-08-08 21:04:40.095098+08
88	Migration20241129124827	2025-08-08 21:04:40.095098+08
89	Migration20241217162224	2025-08-08 21:04:40.095098+08
90	Migration20250326151554	2025-08-08 21:04:40.095098+08
91	Migration20250522181137	2025-08-08 21:04:40.095098+08
92	Migration20250702095353	2025-08-08 21:04:40.095098+08
93	Migration20250704120229	2025-08-08 21:04:40.095098+08
94	Migration20240205025928	2025-08-08 21:04:40.196673+08
95	Migration20240529080336	2025-08-08 21:04:40.196673+08
96	Migration20241202100304	2025-08-08 21:04:40.196673+08
97	Migration20240214033943	2025-08-08 21:04:40.228965+08
98	Migration20240703095850	2025-08-08 21:04:40.228965+08
99	Migration20241202103352	2025-08-08 21:04:40.228965+08
100	Migration20240311145700_InitialSetupMigration	2025-08-08 21:04:40.251093+08
101	Migration20240821170957	2025-08-08 21:04:40.251093+08
102	Migration20240917161003	2025-08-08 21:04:40.251093+08
103	Migration20241217110416	2025-08-08 21:04:40.251093+08
104	Migration20250113122235	2025-08-08 21:04:40.251093+08
105	Migration20250120115002	2025-08-08 21:04:40.251093+08
106	Migration20240509083918_InitialSetupMigration	2025-08-08 21:04:40.315493+08
107	Migration20240628075401	2025-08-08 21:04:40.315493+08
108	Migration20240830094712	2025-08-08 21:04:40.315493+08
109	Migration20250120110514	2025-08-08 21:04:40.315493+08
110	Migration20231228143900	2025-08-08 21:04:40.365162+08
111	Migration20241206101446	2025-08-08 21:04:40.365162+08
112	Migration20250128174331	2025-08-08 21:04:40.365162+08
113	Migration20250505092459	2025-08-08 21:04:40.365162+08
114	Migration20250811164316	2025-08-12 00:43:23.979017+08
\.


--
-- TOC entry 5424 (class 0 OID 163809)
-- Dependencies: 321
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.notification (id, "to", channel, template, data, trigger_type, resource_id, resource_type, receiver_id, original_notification_id, idempotency_key, external_id, provider_id, created_at, updated_at, deleted_at, status) FROM stdin;
\.


--
-- TOC entry 5423 (class 0 OID 163801)
-- Dependencies: 320
-- Data for Name: notification_provider; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.notification_provider (id, handle, name, is_enabled, channels, created_at, updated_at, deleted_at) FROM stdin;
local	local	local	t	{feed}	2025-08-08 21:04:42.366+08	2025-08-08 21:04:42.366+08	\N
\.


--
-- TOC entry 5381 (class 0 OID 163035)
-- Dependencies: 278
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public."order" (id, region_id, display_id, customer_id, version, sales_channel_id, status, is_draft_order, email, currency_code, shipping_address_id, billing_address_id, no_notification, metadata, created_at, updated_at, deleted_at, canceled_at) FROM stdin;
\.


--
-- TOC entry 5379 (class 0 OID 163024)
-- Dependencies: 276
-- Data for Name: order_address; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_address (id, customer_id, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5429 (class 0 OID 163872)
-- Dependencies: 326
-- Data for Name: order_cart; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_cart (order_id, cart_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5383 (class 0 OID 163087)
-- Dependencies: 280
-- Data for Name: order_change; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_change (id, order_id, version, description, status, internal_note, created_by, requested_by, requested_at, confirmed_by, confirmed_at, declined_by, declined_reason, metadata, declined_at, canceled_by, canceled_at, created_at, updated_at, change_type, deleted_at, return_id, claim_id, exchange_id) FROM stdin;
\.


--
-- TOC entry 5385 (class 0 OID 163102)
-- Dependencies: 282
-- Data for Name: order_change_action; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_change_action (id, order_id, version, ordering, order_change_id, reference, reference_id, action, details, amount, raw_amount, internal_note, applied, created_at, updated_at, deleted_at, return_id, claim_id, exchange_id) FROM stdin;
\.


--
-- TOC entry 5403 (class 0 OID 163388)
-- Dependencies: 300
-- Data for Name: order_claim; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_claim (id, order_id, return_id, order_version, display_id, type, no_notification, refund_amount, raw_refund_amount, metadata, created_at, updated_at, deleted_at, canceled_at, created_by) FROM stdin;
\.


--
-- TOC entry 5404 (class 0 OID 163411)
-- Dependencies: 301
-- Data for Name: order_claim_item; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_claim_item (id, claim_id, item_id, is_additional_item, reason, quantity, raw_quantity, note, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5405 (class 0 OID 163424)
-- Dependencies: 302
-- Data for Name: order_claim_item_image; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_claim_item_image (id, claim_item_id, url, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5406 (class 0 OID 163482)
-- Dependencies: 303
-- Data for Name: order_credit_line; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_credit_line (id, order_id, reference, reference_id, amount, raw_amount, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5400 (class 0 OID 163354)
-- Dependencies: 297
-- Data for Name: order_exchange; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_exchange (id, order_id, return_id, order_version, display_id, no_notification, allow_backorder, difference_due, raw_difference_due, metadata, created_at, updated_at, deleted_at, canceled_at, created_by) FROM stdin;
\.


--
-- TOC entry 5401 (class 0 OID 163369)
-- Dependencies: 298
-- Data for Name: order_exchange_item; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_exchange_item (id, exchange_id, item_id, quantity, raw_quantity, note, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5432 (class 0 OID 163888)
-- Dependencies: 329
-- Data for Name: order_fulfillment; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_fulfillment (order_id, fulfillment_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5386 (class 0 OID 163116)
-- Dependencies: 283
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_item (id, order_id, version, item_id, quantity, raw_quantity, fulfilled_quantity, raw_fulfilled_quantity, shipped_quantity, raw_shipped_quantity, return_requested_quantity, raw_return_requested_quantity, return_received_quantity, raw_return_received_quantity, return_dismissed_quantity, raw_return_dismissed_quantity, written_off_quantity, raw_written_off_quantity, metadata, created_at, updated_at, deleted_at, delivered_quantity, raw_delivered_quantity, unit_price, raw_unit_price, compare_at_unit_price, raw_compare_at_unit_price) FROM stdin;
\.


--
-- TOC entry 5388 (class 0 OID 163140)
-- Dependencies: 285
-- Data for Name: order_line_item; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_line_item (id, totals_id, title, subtitle, thumbnail, variant_id, product_id, product_title, product_description, product_subtitle, product_type, product_collection, product_handle, variant_sku, variant_barcode, variant_title, variant_option_values, requires_shipping, is_discountable, is_tax_inclusive, compare_at_unit_price, raw_compare_at_unit_price, unit_price, raw_unit_price, metadata, created_at, updated_at, deleted_at, is_custom_price, product_type_id, is_giftcard) FROM stdin;
\.


--
-- TOC entry 5390 (class 0 OID 163164)
-- Dependencies: 287
-- Data for Name: order_line_item_adjustment; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_line_item_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, created_at, updated_at, item_id, deleted_at, is_tax_inclusive) FROM stdin;
\.


--
-- TOC entry 5389 (class 0 OID 163154)
-- Dependencies: 286
-- Data for Name: order_line_item_tax_line; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_line_item_tax_line (id, description, tax_rate_id, code, rate, raw_rate, provider_id, created_at, updated_at, item_id, deleted_at) FROM stdin;
\.


--
-- TOC entry 5433 (class 0 OID 163894)
-- Dependencies: 330
-- Data for Name: order_payment_collection; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_payment_collection (order_id, payment_collection_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5434 (class 0 OID 163902)
-- Dependencies: 331
-- Data for Name: order_promotion; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_promotion (order_id, promotion_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5387 (class 0 OID 163128)
-- Dependencies: 284
-- Data for Name: order_shipping; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_shipping (id, order_id, version, shipping_method_id, created_at, updated_at, deleted_at, return_id, claim_id, exchange_id) FROM stdin;
\.


--
-- TOC entry 5391 (class 0 OID 163174)
-- Dependencies: 288
-- Data for Name: order_shipping_method; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_shipping_method (id, name, description, amount, raw_amount, is_tax_inclusive, shipping_option_id, data, metadata, created_at, updated_at, deleted_at, is_custom_amount) FROM stdin;
\.


--
-- TOC entry 5392 (class 0 OID 163185)
-- Dependencies: 289
-- Data for Name: order_shipping_method_adjustment; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_shipping_method_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, created_at, updated_at, shipping_method_id, deleted_at) FROM stdin;
\.


--
-- TOC entry 5393 (class 0 OID 163195)
-- Dependencies: 290
-- Data for Name: order_shipping_method_tax_line; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_shipping_method_tax_line (id, description, tax_rate_id, code, rate, raw_rate, provider_id, created_at, updated_at, shipping_method_id, deleted_at) FROM stdin;
\.


--
-- TOC entry 5382 (class 0 OID 163076)
-- Dependencies: 279
-- Data for Name: order_summary; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_summary (id, order_id, version, totals, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5394 (class 0 OID 163205)
-- Dependencies: 291
-- Data for Name: order_transaction; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.order_transaction (id, order_id, version, amount, raw_amount, currency_code, reference, reference_id, created_at, updated_at, deleted_at, return_id, claim_id, exchange_id) FROM stdin;
\.


--
-- TOC entry 5374 (class 0 OID 162898)
-- Dependencies: 271
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.payment (id, amount, raw_amount, currency_code, provider_id, data, created_at, updated_at, deleted_at, captured_at, canceled_at, payment_collection_id, payment_session_id, metadata) FROM stdin;
\.


--
-- TOC entry 5370 (class 0 OID 162852)
-- Dependencies: 267
-- Data for Name: payment_collection; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.payment_collection (id, currency_code, amount, raw_amount, authorized_amount, raw_authorized_amount, captured_amount, raw_captured_amount, refunded_amount, raw_refunded_amount, created_at, updated_at, deleted_at, completed_at, status, metadata) FROM stdin;
\.


--
-- TOC entry 5372 (class 0 OID 162880)
-- Dependencies: 269
-- Data for Name: payment_collection_payment_providers; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.payment_collection_payment_providers (payment_collection_id, payment_provider_id) FROM stdin;
\.


--
-- TOC entry 5371 (class 0 OID 162872)
-- Dependencies: 268
-- Data for Name: payment_provider; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.payment_provider (id, is_enabled, created_at, updated_at, deleted_at) FROM stdin;
pp_system_default	t	2025-08-08 21:04:42.365+08	2025-08-08 21:04:42.365+08	\N
pp_ecpay_credit_card_ecpay	t	2025-08-09 03:17:18.742+08	2025-08-09 03:17:18.742+08	\N
\.


--
-- TOC entry 5373 (class 0 OID 162887)
-- Dependencies: 270
-- Data for Name: payment_session; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.payment_session (id, currency_code, amount, raw_amount, provider_id, data, context, status, authorized_at, payment_collection_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5332 (class 0 OID 161951)
-- Dependencies: 229
-- Data for Name: price; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.price (id, title, price_set_id, currency_code, raw_amount, rules_count, created_at, updated_at, deleted_at, price_list_id, amount, min_quantity, max_quantity) FROM stdin;
price_01K24WV2GVSC890AE7J68ZNB0J	\N	pset_01K24WV2GVYAQPQN53ZGA5PJ2G	usd	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.596+08	2025-08-08 21:10:05.596+08	\N	\N	10	\N	\N
price_01K24WV2GVH7SFCM90AAYA5QNH	\N	pset_01K24WV2GVYAQPQN53ZGA5PJ2G	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.596+08	2025-08-08 21:10:05.596+08	\N	\N	10	\N	\N
price_01K24WV2GV7EXWYTEK54SDX34A	\N	pset_01K24WV2GVYAQPQN53ZGA5PJ2G	usd	{"value": "10", "precision": 20}	1	2025-08-08 21:10:05.596+08	2025-08-08 21:10:05.596+08	\N	\N	10	\N	\N
price_01K24WV2GVNTTP3R1KNQ3G10VB	\N	pset_01K24WV2GV823P05QQ4XBMAG55	usd	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.596+08	2025-08-08 21:10:05.596+08	\N	\N	10	\N	\N
price_01K24WV2GV34A195N096QMJAPZ	\N	pset_01K24WV2GV823P05QQ4XBMAG55	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.596+08	2025-08-08 21:10:05.596+08	\N	\N	10	\N	\N
price_01K24WV2GVEWDXPFFZ96QQ4QSE	\N	pset_01K24WV2GV823P05QQ4XBMAG55	usd	{"value": "10", "precision": 20}	1	2025-08-08 21:10:05.596+08	2025-08-08 21:10:05.596+08	\N	\N	10	\N	\N
price_01K24WV2P84WJMQ58CPY06ZCF2	\N	pset_01K24WV2P80SRSFGWYDAKR425R	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2P84W5733GQCSS2PDYS	\N	pset_01K24WV2P80SRSFGWYDAKR425R	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2P826ED29691VE9CYH1	\N	pset_01K24WV2P8VS0Z3HKT90AR3SGA	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2P808P1TPG7CQAW26HR	\N	pset_01K24WV2P8VS0Z3HKT90AR3SGA	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2P8TAZRPKRNTVK48YWP	\N	pset_01K24WV2P8HQRYDKFN2X60ME07	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2P83BPDQF4VWSN632NF	\N	pset_01K24WV2P8HQRYDKFN2X60ME07	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2P9Y9N4P6Q1AWX0X5MQ	\N	pset_01K24WV2P90W8MG6SCZ7G94EAX	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2P92TGFX18NQ8CK9VM8	\N	pset_01K24WV2P90W8MG6SCZ7G94EAX	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2P9QG4YFV6YSG0H5EFW	\N	pset_01K24WV2P9TP27B7405ZKQT7T4	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2P9J4BEYAWWN3P5KK5J	\N	pset_01K24WV2P9TP27B7405ZKQT7T4	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2P9GH13A2AM62Z4CHHJ	\N	pset_01K24WV2P9E58Z7HK2EWRYKC3W	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2P9WYNTXWT9XND7GHS5	\N	pset_01K24WV2P9E58Z7HK2EWRYKC3W	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2P9PBF6NCMNTDR41KZC	\N	pset_01K24WV2P93YQ5J8MWRAPH6MQK	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2P9329TR08Z3CQ8Y0GK	\N	pset_01K24WV2P93YQ5J8MWRAPH6MQK	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2P9TM2F8ZR62Y4CMDJB	\N	pset_01K24WV2P9N9YB4AC1JY610JZC	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2P9TQ0E2HHA5PZM9YY8	\N	pset_01K24WV2P9N9YB4AC1JY610JZC	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2P9P3DSZFQZFF6GR3F5	\N	pset_01K24WV2P99ZQ0HYGEJW5SN874	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2P9G3FCXCFH0R27EBZ9	\N	pset_01K24WV2P99ZQ0HYGEJW5SN874	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2P9YHXXE4ZZ12JAYTHE	\N	pset_01K24WV2P9526JRBXY7SXXZXYX	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2P9HRZR5WNW3M3DEPJ4	\N	pset_01K24WV2P9526JRBXY7SXXZXYX	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2P96H3M0RB36RHBKQ2S	\N	pset_01K24WV2PAZJ6EBC9644NPR486	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2PAJXET0N1RGDH33RA4	\N	pset_01K24WV2PAZJ6EBC9644NPR486	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2PA3R02NN5C2KF3WX49	\N	pset_01K24WV2PAP6C1MB7NSTQD5300	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2PA6DHT42YYNSA0RWS8	\N	pset_01K24WV2PAP6C1MB7NSTQD5300	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2PA9W384M4Z6MMR592Q	\N	pset_01K24WV2PAARRHMT1ZDW4JQHSY	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2PACEA25R22QR1CS1HH	\N	pset_01K24WV2PAARRHMT1ZDW4JQHSY	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2PA6FY7VREPXPZH5KPZ	\N	pset_01K24WV2PAZY8Z218T29XWASDG	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2PATFNTE4W056KSNYPB	\N	pset_01K24WV2PAZY8Z218T29XWASDG	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2PAJ4Z6N9HZXZPHD3GK	\N	pset_01K24WV2PADE034JRZTTXW5Z0Y	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2PA5VTV2BVQPHQG91AP	\N	pset_01K24WV2PADE034JRZTTXW5Z0Y	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2PAV68NT6MVM3197BDM	\N	pset_01K24WV2PADFYVBGRV6SV3BRQ0	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2PAVZ0J3B6DMC64J9RS	\N	pset_01K24WV2PADFYVBGRV6SV3BRQ0	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2PAV12NEKJCH6WKQJWZ	\N	pset_01K24WV2PAW6DSACWG7M2BC2EJ	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2PA0DJQGW3QH2DPSENX	\N	pset_01K24WV2PAW6DSACWG7M2BC2EJ	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2PAV6JV2EGWZ4BVSDR4	\N	pset_01K24WV2PAHJQ8KGKW3MFCQ6T9	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2PA7NV40DBS8JNWDB3W	\N	pset_01K24WV2PAHJQ8KGKW3MFCQ6T9	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2PA8428CJ3JKPPM9M85	\N	pset_01K24WV2PAA51BS830QTSDFB9C	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2PAJAPK5NG1JDDKJZKN	\N	pset_01K24WV2PAA51BS830QTSDFB9C	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_01K24WV2PBC31VVH60NM80FKME	\N	pset_01K24WV2PBV7GJWFY7ZZQ5A66P	eur	{"value": "10", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	10	\N	\N
price_01K24WV2PBV28NX5Z5CXFFB5CR	\N	pset_01K24WV2PBV7GJWFY7ZZQ5A66P	usd	{"value": "15", "precision": 20}	0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N	\N	15	\N	\N
price_3718fad036573b80bf2b5d	\N	pset_01K24WV2GV823P05QQ4XBMAG55	twd	{"value": "320", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	320	\N	\N
price_9b0598916f3d0ab64bad6b	\N	pset_01K24WV2GV823P05QQ4XBMAG55	twd	{"value": "320", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	320	\N	\N
price_aeb6d37ddcdafa0a4649a6	\N	pset_01K24WV2GVYAQPQN53ZGA5PJ2G	twd	{"value": "320", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	320	\N	\N
price_e7b9e83aa12fa4d33e3c39	\N	pset_01K24WV2GVYAQPQN53ZGA5PJ2G	twd	{"value": "320", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	320	\N	\N
price_340badd2dd90f45e7fe23b	\N	pset_01K24WV2P80SRSFGWYDAKR425R	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_e5c52140665530a343d45e	\N	pset_01K24WV2P8HQRYDKFN2X60ME07	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_8b0cf51133ebac4b6d0587	\N	pset_01K24WV2P8VS0Z3HKT90AR3SGA	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_ccf417439235cb7a79cdf2	\N	pset_01K24WV2P90W8MG6SCZ7G94EAX	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_1f0212391c741281074199	\N	pset_01K24WV2P93YQ5J8MWRAPH6MQK	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_89fff30fca81ca82b6a93d	\N	pset_01K24WV2P9526JRBXY7SXXZXYX	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_1cc27d1aae8b440c525140	\N	pset_01K24WV2P99ZQ0HYGEJW5SN874	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_7caf7b3984b878f322430e	\N	pset_01K24WV2P9E58Z7HK2EWRYKC3W	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_3ce39ca6543752027a5183	\N	pset_01K24WV2P9N9YB4AC1JY610JZC	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_d50b2e80e0ad15616f813f	\N	pset_01K24WV2P9TP27B7405ZKQT7T4	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_4233c8cede44fdf91ea63d	\N	pset_01K24WV2PAA51BS830QTSDFB9C	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_74d05dd1ea306cc164b166	\N	pset_01K24WV2PAARRHMT1ZDW4JQHSY	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_fa9ca44aaeb1d259538376	\N	pset_01K24WV2PADE034JRZTTXW5Z0Y	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_c269f2608e7867c4704b0a	\N	pset_01K24WV2PADFYVBGRV6SV3BRQ0	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_727f9dd0516de4b55f301a	\N	pset_01K24WV2PAHJQ8KGKW3MFCQ6T9	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_441862b1295abeabf21669	\N	pset_01K24WV2PAP6C1MB7NSTQD5300	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_14a7b1e88f3e3ff56e3760	\N	pset_01K24WV2PAW6DSACWG7M2BC2EJ	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_205a36fc049d29367b32b6	\N	pset_01K24WV2PAZJ6EBC9644NPR486	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_804b8d706684585ca41a4f	\N	pset_01K24WV2PAZY8Z218T29XWASDG	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
price_b7c1221498d3edee866303	\N	pset_01K24WV2PBV7GJWFY7ZZQ5A66P	twd	{"value": "480", "precision": 20}	0	2025-08-08 21:19:14.390247+08	2025-08-08 21:19:14.390247+08	\N	\N	480	\N	\N
\.


--
-- TOC entry 5334 (class 0 OID 162027)
-- Dependencies: 231
-- Data for Name: price_list; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.price_list (id, status, starts_at, ends_at, rules_count, title, description, type, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5335 (class 0 OID 162037)
-- Dependencies: 232
-- Data for Name: price_list_rule; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.price_list_rule (id, price_list_id, created_at, updated_at, deleted_at, value, attribute) FROM stdin;
\.


--
-- TOC entry 5336 (class 0 OID 162132)
-- Dependencies: 233
-- Data for Name: price_preference; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.price_preference (id, attribute, value, is_tax_inclusive, created_at, updated_at, deleted_at) FROM stdin;
prpref_01K24WHT21WZ7DPXZBD2S57ZS3	currency_code	eur	f	2025-08-08 21:05:02.018+08	2025-08-08 21:05:02.018+08	\N
prpref_01K24WV2D7R0ZMRFMJ8DYB6Q7D	currency_code	usd	f	2025-08-08 21:10:05.479+08	2025-08-08 21:10:05.479+08	\N
prpref_01K24WV2DZ3W0CXV87JCY3NYYQ	region_id	reg_01K24WV2DDAE1HDAP5WSC3H6R3	f	2025-08-08 21:10:05.503+08	2025-08-08 21:10:05.503+08	\N
prpref_01K24WV2DZZZPQ60NFA32K954P	region_id	reg_01K24WV2DDTY3K9DSET7GSYZ5D	f	2025-08-08 21:10:05.503+08	2025-08-08 21:10:05.503+08	\N
prpref_01K24X0RS3BVWSR9R3QGY532SF	currency_code	twd	f	2025-08-08 21:13:12.227+08	2025-08-08 21:13:12.227+08	\N
prpref_01K24X0RSQP075JQ83WD4E6XSX	region_id	reg_01K24X0RS9F2Q0HE4AK13HCP33	f	2025-08-08 21:13:12.248+08	2025-08-08 21:13:12.248+08	\N
\.


--
-- TOC entry 5333 (class 0 OID 161982)
-- Dependencies: 230
-- Data for Name: price_rule; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.price_rule (id, value, priority, price_id, created_at, updated_at, deleted_at, attribute, operator) FROM stdin;
prule_01K24WV2GVVJCD7H725220Z32N	reg_01K24WV2DDAE1HDAP5WSC3H6R3	0	price_01K24WV2GV7EXWYTEK54SDX34A	2025-08-08 21:10:05.596+08	2025-08-08 21:10:05.596+08	\N	region_id	eq
prule_01K24WV2GV5H4P0V2DJ79CYNTP	reg_01K24WV2DDAE1HDAP5WSC3H6R3	0	price_01K24WV2GVEWDXPFFZ96QQ4QSE	2025-08-08 21:10:05.596+08	2025-08-08 21:10:05.596+08	\N	region_id	eq
\.


--
-- TOC entry 5331 (class 0 OID 161942)
-- Dependencies: 228
-- Data for Name: price_set; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.price_set (id, created_at, updated_at, deleted_at) FROM stdin;
pset_01K24WV2GVYAQPQN53ZGA5PJ2G	2025-08-08 21:10:05.596+08	2025-08-08 21:10:05.596+08	\N
pset_01K24WV2GV823P05QQ4XBMAG55	2025-08-08 21:10:05.596+08	2025-08-08 21:10:05.596+08	\N
pset_01K24WV2P80SRSFGWYDAKR425R	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2P8VS0Z3HKT90AR3SGA	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2P8HQRYDKFN2X60ME07	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2P90W8MG6SCZ7G94EAX	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2P9TP27B7405ZKQT7T4	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2P9E58Z7HK2EWRYKC3W	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2P93YQ5J8MWRAPH6MQK	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2P9N9YB4AC1JY610JZC	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2P99ZQ0HYGEJW5SN874	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2P9526JRBXY7SXXZXYX	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2PAZJ6EBC9644NPR486	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2PAP6C1MB7NSTQD5300	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2PAARRHMT1ZDW4JQHSY	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2PAZY8Z218T29XWASDG	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2PADE034JRZTTXW5Z0Y	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2PADFYVBGRV6SV3BRQ0	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2PAW6DSACWG7M2BC2EJ	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2PAHJQ8KGKW3MFCQ6T9	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2PAA51BS830QTSDFB9C	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
pset_01K24WV2PBV7GJWFY7ZZQ5A66P	2025-08-08 21:10:05.771+08	2025-08-08 21:10:05.771+08	\N
\.


--
-- TOC entry 5319 (class 0 OID 161629)
-- Dependencies: 216
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product (id, title, handle, subtitle, description, is_giftcard, status, thumbnail, weight, length, height, width, origin_country, hs_code, mid_code, material, collection_id, type_id, discountable, external_id, created_at, updated_at, deleted_at, metadata) FROM stdin;
prod_01K24WV2JXXDK8XDNKS68JVDVW	Medusa T-Shirt	t-shirt	\N	Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.	f	published	https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png	400	\N	\N	\N	\N	\N	\N	\N	pcol_featured	\N	t	\N	2025-08-08 21:10:05.664+08	2025-08-08 21:10:05.665+08	\N	\N
prod_01K24WV2JXVKQCRK39EB3636HA	Medusa Sweatshirt	sweatshirt	\N	Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.	f	published	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png	400	\N	\N	\N	\N	\N	\N	\N	pcol_featured	\N	t	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N	\N
prod_01K24WV2JXFKJEQ0A7TBMPNCP3	Medusa Sweatpants	sweatpants	\N	Reimagine the feeling of classic sweatpants. With our cotton sweatpants, everyday essentials no longer have to be ordinary.	f	published	https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png	400	\N	\N	\N	\N	\N	\N	\N	pcol_featured	\N	t	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N	\N
prod_01K24WV2JX0JRSGMFRQ6J3J2JM	Medusa Shorts	shorts	\N	Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.	f	published	https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png	400	\N	\N	\N	\N	\N	\N	\N	pcol_featured	\N	t	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N	\N
\.


--
-- TOC entry 5327 (class 0 OID 161729)
-- Dependencies: 224
-- Data for Name: product_category; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_category (id, name, description, handle, mpath, is_active, is_internal, rank, parent_category_id, created_at, updated_at, deleted_at, metadata) FROM stdin;
pcat_01K24WV2JHMEKFHMHZCNHFK19V	Shirts		shirts	pcat_01K24WV2JHMEKFHMHZCNHFK19V	t	f	0	\N	2025-08-08 21:10:05.65+08	2025-08-08 21:10:05.65+08	\N	\N
pcat_01K24WV2JJ7CXARCWDA7N5G8VG	Sweatshirts		sweatshirts	pcat_01K24WV2JJ7CXARCWDA7N5G8VG	t	f	1	\N	2025-08-08 21:10:05.65+08	2025-08-08 21:10:05.65+08	\N	\N
pcat_01K24WV2JJED6DJFBA3056G7ZW	Pants		pants	pcat_01K24WV2JJED6DJFBA3056G7ZW	t	f	2	\N	2025-08-08 21:10:05.65+08	2025-08-08 21:10:05.65+08	\N	\N
pcat_01K24WV2JJFNA1Z8BFJEV40TD0	Merch		merch	pcat_01K24WV2JJFNA1Z8BFJEV40TD0	t	f	3	\N	2025-08-08 21:10:05.65+08	2025-08-08 21:10:05.65+08	\N	\N
\.


--
-- TOC entry 5329 (class 0 OID 161759)
-- Dependencies: 226
-- Data for Name: product_category_product; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_category_product (product_id, product_category_id) FROM stdin;
prod_01K24WV2JXXDK8XDNKS68JVDVW	pcat_01K24WV2JHMEKFHMHZCNHFK19V
prod_01K24WV2JXVKQCRK39EB3636HA	pcat_01K24WV2JJ7CXARCWDA7N5G8VG
prod_01K24WV2JXFKJEQ0A7TBMPNCP3	pcat_01K24WV2JJED6DJFBA3056G7ZW
prod_01K24WV2JX0JRSGMFRQ6J3J2JM	pcat_01K24WV2JJFNA1Z8BFJEV40TD0
\.


--
-- TOC entry 5326 (class 0 OID 161718)
-- Dependencies: 223
-- Data for Name: product_collection; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_collection (id, title, handle, metadata, created_at, updated_at, deleted_at) FROM stdin;
pcol_featured	Featured Products	featured	\N	2025-08-08 21:33:04.89712+08	2025-08-08 21:33:04.89712+08	\N
pcol_clothing	Clothing	clothing	\N	2025-08-08 21:33:04.89712+08	2025-08-08 21:33:04.89712+08	\N
\.


--
-- TOC entry 5321 (class 0 OID 161663)
-- Dependencies: 218
-- Data for Name: product_option; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_option (id, title, product_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
opt_01K24WV2JYY7H3DZ17DTRQZ1SQ	Size	prod_01K24WV2JXXDK8XDNKS68JVDVW	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
opt_01K24WV2JY7BTQ7Q8RW3R4GYF7	Color	prod_01K24WV2JXXDK8XDNKS68JVDVW	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
opt_01K24WV2JZ57JQC40AVMA6PY4G	Size	prod_01K24WV2JXVKQCRK39EB3636HA	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
opt_01K24WV2JZWQCADXPJDHQR7GW7	Size	prod_01K24WV2JXFKJEQ0A7TBMPNCP3	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
opt_01K24WV2K0CZ27Z6G1CYPQ43S2	Size	prod_01K24WV2JX0JRSGMFRQ6J3J2JM	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
\.


--
-- TOC entry 5322 (class 0 OID 161674)
-- Dependencies: 219
-- Data for Name: product_option_value; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_option_value (id, value, option_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
optval_01K24WV2JY4W756B4XA2CNA25D	S	opt_01K24WV2JYY7H3DZ17DTRQZ1SQ	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2JYZANHKDD9CTR9Y1S2	M	opt_01K24WV2JYY7H3DZ17DTRQZ1SQ	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2JY4X3S94ZE85H89101	L	opt_01K24WV2JYY7H3DZ17DTRQZ1SQ	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2JYH8TZ3NYAMXKG3CEC	XL	opt_01K24WV2JYY7H3DZ17DTRQZ1SQ	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2JY8RWJQWAAYEMGHGTK	Black	opt_01K24WV2JY7BTQ7Q8RW3R4GYF7	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2JY2PF9J6TBRT6VZ23G	White	opt_01K24WV2JY7BTQ7Q8RW3R4GYF7	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2JZ9WDH6JTNHV8QMJ5S	S	opt_01K24WV2JZ57JQC40AVMA6PY4G	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2JZZ2GQQY9VDAGJE6CQ	M	opt_01K24WV2JZ57JQC40AVMA6PY4G	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2JZ9BQD1YR75ZVWY602	L	opt_01K24WV2JZ57JQC40AVMA6PY4G	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2JZ07HYN23ZM9879ZSE	XL	opt_01K24WV2JZ57JQC40AVMA6PY4G	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2JZT6AEBCVPDP92WW2M	S	opt_01K24WV2JZWQCADXPJDHQR7GW7	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2JZTKBKB3YEK55QDM2K	M	opt_01K24WV2JZWQCADXPJDHQR7GW7	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2JZ2P74R8BTXHFSSTDW	L	opt_01K24WV2JZWQCADXPJDHQR7GW7	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2JZTYNF8NBCTGC5K6VJ	XL	opt_01K24WV2JZWQCADXPJDHQR7GW7	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2K0VG77Y8YC47QYM5B7	S	opt_01K24WV2K0CZ27Z6G1CYPQ43S2	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2K00EPC7MYVJXQ1NJVY	M	opt_01K24WV2K0CZ27Z6G1CYPQ43S2	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2K08A9M2QV6MRA3VMKG	L	opt_01K24WV2K0CZ27Z6G1CYPQ43S2	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
optval_01K24WV2K001HM8GABECEHDC0K	XL	opt_01K24WV2K0CZ27Z6G1CYPQ43S2	\N	2025-08-08 21:10:05.665+08	2025-08-08 21:10:05.665+08	\N
\.


--
-- TOC entry 5437 (class 0 OID 163935)
-- Dependencies: 334
-- Data for Name: product_sales_channel; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_sales_channel (product_id, sales_channel_id, id, created_at, updated_at, deleted_at) FROM stdin;
prod_01K24WV2JXXDK8XDNKS68JVDVW	sc_01K24WHT1DTGX58A570V7ZKBFQ	prodsc_01K24WV2KWZE1HX9F222PZHQ5V	2025-08-08 21:10:05.69213+08	2025-08-08 21:10:05.69213+08	\N
prod_01K24WV2JXVKQCRK39EB3636HA	sc_01K24WHT1DTGX58A570V7ZKBFQ	prodsc_01K24WV2KWQ76FW0GW8MED4DS5	2025-08-08 21:10:05.69213+08	2025-08-08 21:10:05.69213+08	\N
prod_01K24WV2JXFKJEQ0A7TBMPNCP3	sc_01K24WHT1DTGX58A570V7ZKBFQ	prodsc_01K24WV2KWZB098W0BAMK338JM	2025-08-08 21:10:05.69213+08	2025-08-08 21:10:05.69213+08	\N
prod_01K24WV2JX0JRSGMFRQ6J3J2JM	sc_01K24WHT1DTGX58A570V7ZKBFQ	prodsc_01K24WV2KWAN7J7QQVCQ4HRWA4	2025-08-08 21:10:05.69213+08	2025-08-08 21:10:05.69213+08	\N
\.


--
-- TOC entry 5445 (class 0 OID 164041)
-- Dependencies: 342
-- Data for Name: product_shipping_profile; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_shipping_profile (product_id, shipping_profile_id, id, created_at, updated_at, deleted_at) FROM stdin;
prod_01K24WV2JXXDK8XDNKS68JVDVW	sp_01K24WH7GD06AP9AMQ26X5P7QC	prodsp_01K24WV2M7F7HHP0JJV0A6TYBY	2025-08-08 21:10:05.703725+08	2025-08-08 21:10:05.703725+08	\N
prod_01K24WV2JXVKQCRK39EB3636HA	sp_01K24WH7GD06AP9AMQ26X5P7QC	prodsp_01K24WV2M81BRJKZD29X6Z22BE	2025-08-08 21:10:05.703725+08	2025-08-08 21:10:05.703725+08	\N
prod_01K24WV2JXFKJEQ0A7TBMPNCP3	sp_01K24WH7GD06AP9AMQ26X5P7QC	prodsp_01K24WV2M8FWZEDA51YBYYMZJQ	2025-08-08 21:10:05.703725+08	2025-08-08 21:10:05.703725+08	\N
prod_01K24WV2JX0JRSGMFRQ6J3J2JM	sp_01K24WH7GD06AP9AMQ26X5P7QC	prodsp_01K24WV2M81EER0T7E1W52QSMN	2025-08-08 21:10:05.703725+08	2025-08-08 21:10:05.703725+08	\N
\.


--
-- TOC entry 5324 (class 0 OID 161696)
-- Dependencies: 221
-- Data for Name: product_tag; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_tag (id, value, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5328 (class 0 OID 161745)
-- Dependencies: 225
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_tags (product_id, product_tag_id) FROM stdin;
\.


--
-- TOC entry 5325 (class 0 OID 161707)
-- Dependencies: 222
-- Data for Name: product_type; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_type (id, value, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5320 (class 0 OID 161645)
-- Dependencies: 217
-- Data for Name: product_variant; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_variant (id, title, sku, barcode, ean, upc, allow_backorder, manage_inventory, hs_code, origin_country, mid_code, material, weight, length, height, width, metadata, variant_rank, product_id, created_at, updated_at, deleted_at) FROM stdin;
variant_01K24WV2MYECYCXY7N9N3AXDSE	S / Black	SHIRT-S-BLACK	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXXDK8XDNKS68JVDVW	2025-08-08 21:10:05.727+08	2025-08-08 21:10:05.727+08	\N
variant_01K24WV2MYR9FS89871FW6EGA8	S / White	SHIRT-S-WHITE	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXXDK8XDNKS68JVDVW	2025-08-08 21:10:05.727+08	2025-08-08 21:10:05.727+08	\N
variant_01K24WV2MYXK5935V9P1VWK7WB	M / Black	SHIRT-M-BLACK	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXXDK8XDNKS68JVDVW	2025-08-08 21:10:05.727+08	2025-08-08 21:10:05.727+08	\N
variant_01K24WV2MYGNAGGGCG22B8P645	M / White	SHIRT-M-WHITE	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXXDK8XDNKS68JVDVW	2025-08-08 21:10:05.727+08	2025-08-08 21:10:05.727+08	\N
variant_01K24WV2MY8Z3GYC6M2MZ2S1T6	L / Black	SHIRT-L-BLACK	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXXDK8XDNKS68JVDVW	2025-08-08 21:10:05.727+08	2025-08-08 21:10:05.727+08	\N
variant_01K24WV2MYPXY9AJFC7EWJ19Y3	L / White	SHIRT-L-WHITE	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXXDK8XDNKS68JVDVW	2025-08-08 21:10:05.727+08	2025-08-08 21:10:05.727+08	\N
variant_01K24WV2MYGG9RT7K4QMGG524Z	XL / Black	SHIRT-XL-BLACK	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXXDK8XDNKS68JVDVW	2025-08-08 21:10:05.727+08	2025-08-08 21:10:05.727+08	\N
variant_01K24WV2MYCMBGJNTBDNSW4G5Q	XL / White	SHIRT-XL-WHITE	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXXDK8XDNKS68JVDVW	2025-08-08 21:10:05.727+08	2025-08-08 21:10:05.727+08	\N
variant_01K24WV2MYVB0J8MKRCWAFWK9Q	S	SWEATSHIRT-S	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXVKQCRK39EB3636HA	2025-08-08 21:10:05.727+08	2025-08-08 21:10:05.727+08	\N
variant_01K24WV2MYMD3AHRJHXEG6T69D	M	SWEATSHIRT-M	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXVKQCRK39EB3636HA	2025-08-08 21:10:05.727+08	2025-08-08 21:10:05.727+08	\N
variant_01K24WV2MY671ZJXHS5V9TMQ73	L	SWEATSHIRT-L	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXVKQCRK39EB3636HA	2025-08-08 21:10:05.727+08	2025-08-08 21:10:05.727+08	\N
variant_01K24WV2MYH9K6N0JBTV1DMADQ	XL	SWEATSHIRT-XL	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXVKQCRK39EB3636HA	2025-08-08 21:10:05.727+08	2025-08-08 21:10:05.727+08	\N
variant_01K24WV2MZ12N3E36NCD5J6NFB	S	SWEATPANTS-S	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXFKJEQ0A7TBMPNCP3	2025-08-08 21:10:05.728+08	2025-08-08 21:10:05.728+08	\N
variant_01K24WV2MZD3HPW78M77GRA2BP	M	SWEATPANTS-M	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXFKJEQ0A7TBMPNCP3	2025-08-08 21:10:05.728+08	2025-08-08 21:10:05.728+08	\N
variant_01K24WV2MZQ66HRWQDMZDJFG2K	L	SWEATPANTS-L	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXFKJEQ0A7TBMPNCP3	2025-08-08 21:10:05.728+08	2025-08-08 21:10:05.728+08	\N
variant_01K24WV2MZW926KQYR9A6B051W	XL	SWEATPANTS-XL	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JXFKJEQ0A7TBMPNCP3	2025-08-08 21:10:05.728+08	2025-08-08 21:10:05.728+08	\N
variant_01K24WV2MZA8KF38NM1W802D74	S	SHORTS-S	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JX0JRSGMFRQ6J3J2JM	2025-08-08 21:10:05.728+08	2025-08-08 21:10:05.728+08	\N
variant_01K24WV2MZFYNJ8VSGEB2XV16R	M	SHORTS-M	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JX0JRSGMFRQ6J3J2JM	2025-08-08 21:10:05.728+08	2025-08-08 21:10:05.728+08	\N
variant_01K24WV2MZWDMNDSA33H1P121T	L	SHORTS-L	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JX0JRSGMFRQ6J3J2JM	2025-08-08 21:10:05.728+08	2025-08-08 21:10:05.728+08	\N
variant_01K24WV2MZMW6TGM2JZEA1W437	XL	SHORTS-XL	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01K24WV2JX0JRSGMFRQ6J3J2JM	2025-08-08 21:10:05.728+08	2025-08-08 21:10:05.728+08	\N
\.


--
-- TOC entry 5436 (class 0 OID 163932)
-- Dependencies: 333
-- Data for Name: product_variant_inventory_item; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_variant_inventory_item (variant_id, inventory_item_id, id, required_quantity, created_at, updated_at, deleted_at) FROM stdin;
variant_01K24WV2MYECYCXY7N9N3AXDSE	iitem_01K24WV2NHGFW9BCSTC847B6XH	pvitem_01K24WV2NZRZWZ0AXQD0CZ0PTK	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MYR9FS89871FW6EGA8	iitem_01K24WV2NJWA577YS23M3W2K4B	pvitem_01K24WV2NZJS0D1W27MKX48R92	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MYXK5935V9P1VWK7WB	iitem_01K24WV2NJNH32M3VKYMM7RM2A	pvitem_01K24WV2NZDK30PHAQ446P238V	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MYGNAGGGCG22B8P645	iitem_01K24WV2NJXGK3JCZ0R1JFNKMR	pvitem_01K24WV2NZ0Z0H5VZ2CH3HZHSW	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MY8Z3GYC6M2MZ2S1T6	iitem_01K24WV2NJDHT97XPJHWN606JB	pvitem_01K24WV2NZNW9XS7RJ6AFFBP24	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MYPXY9AJFC7EWJ19Y3	iitem_01K24WV2NJ3TFAW2CAQQ1HS5D8	pvitem_01K24WV2NZKGFWG8S4C5WFXZNA	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MYGG9RT7K4QMGG524Z	iitem_01K24WV2NJ00TAMH29K10Q5F33	pvitem_01K24WV2NZXAP6Z54HRB770GMY	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MYCMBGJNTBDNSW4G5Q	iitem_01K24WV2NJXFJ94NNKBPV55MKT	pvitem_01K24WV2P0VCKS9QYHVM9AX7XF	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MYVB0J8MKRCWAFWK9Q	iitem_01K24WV2NJAT9GWHKG7HHH5THK	pvitem_01K24WV2P0G3N5XMEM4KTKT2PE	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MYMD3AHRJHXEG6T69D	iitem_01K24WV2NJZ915NF5V809RCK1S	pvitem_01K24WV2P0SXHA23FJ03YVWRW6	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MY671ZJXHS5V9TMQ73	iitem_01K24WV2NJ0SPEZ8MA50X0Z5A1	pvitem_01K24WV2P0R3KY9B4SEYEVGJ37	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MYH9K6N0JBTV1DMADQ	iitem_01K24WV2NJQSSV6T04EJH5BNSY	pvitem_01K24WV2P0FH6ZNVZV0BP95212	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MZ12N3E36NCD5J6NFB	iitem_01K24WV2NJQ9JSATF0EX81E8ZC	pvitem_01K24WV2P0FFFG2D40AYXYX9HC	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MZD3HPW78M77GRA2BP	iitem_01K24WV2NJC8K6QSCXP9PBZSVX	pvitem_01K24WV2P0ABSY0VR085PFQSFZ	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MZQ66HRWQDMZDJFG2K	iitem_01K24WV2NJFCSYJP68EE9BZTQX	pvitem_01K24WV2P0PZ8JTC4ADDKHKJHW	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MZW926KQYR9A6B051W	iitem_01K24WV2NJAV1A8HS38AQ2BBVF	pvitem_01K24WV2P0XKV099S5429EWVM8	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MZA8KF38NM1W802D74	iitem_01K24WV2NJXMX1G59HFB9GFEEQ	pvitem_01K24WV2P0Q8KB84KE8R4ZK05R	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MZFYNJ8VSGEB2XV16R	iitem_01K24WV2NJ5F4NK91WEJPC4Y85	pvitem_01K24WV2P0H5X604X50W7K0RN1	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MZWDMNDSA33H1P121T	iitem_01K24WV2NJTAWXN5QQGKJT06YH	pvitem_01K24WV2P0A9YMG6MJSG1MDBWW	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
variant_01K24WV2MZMW6TGM2JZEA1W437	iitem_01K24WV2NJ4EE7X4SQVZRV36GR	pvitem_01K24WV2P04XJ8E4AN1DC6G3E6	1	2025-08-08 21:10:05.759298+08	2025-08-08 21:10:05.759298+08	\N
\.


--
-- TOC entry 5330 (class 0 OID 161766)
-- Dependencies: 227
-- Data for Name: product_variant_option; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_variant_option (variant_id, option_value_id) FROM stdin;
variant_01K24WV2MYECYCXY7N9N3AXDSE	optval_01K24WV2JY4W756B4XA2CNA25D
variant_01K24WV2MYECYCXY7N9N3AXDSE	optval_01K24WV2JY8RWJQWAAYEMGHGTK
variant_01K24WV2MYR9FS89871FW6EGA8	optval_01K24WV2JY4W756B4XA2CNA25D
variant_01K24WV2MYR9FS89871FW6EGA8	optval_01K24WV2JY2PF9J6TBRT6VZ23G
variant_01K24WV2MYXK5935V9P1VWK7WB	optval_01K24WV2JYZANHKDD9CTR9Y1S2
variant_01K24WV2MYXK5935V9P1VWK7WB	optval_01K24WV2JY8RWJQWAAYEMGHGTK
variant_01K24WV2MYGNAGGGCG22B8P645	optval_01K24WV2JYZANHKDD9CTR9Y1S2
variant_01K24WV2MYGNAGGGCG22B8P645	optval_01K24WV2JY2PF9J6TBRT6VZ23G
variant_01K24WV2MY8Z3GYC6M2MZ2S1T6	optval_01K24WV2JY4X3S94ZE85H89101
variant_01K24WV2MY8Z3GYC6M2MZ2S1T6	optval_01K24WV2JY8RWJQWAAYEMGHGTK
variant_01K24WV2MYPXY9AJFC7EWJ19Y3	optval_01K24WV2JY4X3S94ZE85H89101
variant_01K24WV2MYPXY9AJFC7EWJ19Y3	optval_01K24WV2JY2PF9J6TBRT6VZ23G
variant_01K24WV2MYGG9RT7K4QMGG524Z	optval_01K24WV2JYH8TZ3NYAMXKG3CEC
variant_01K24WV2MYGG9RT7K4QMGG524Z	optval_01K24WV2JY8RWJQWAAYEMGHGTK
variant_01K24WV2MYCMBGJNTBDNSW4G5Q	optval_01K24WV2JYH8TZ3NYAMXKG3CEC
variant_01K24WV2MYCMBGJNTBDNSW4G5Q	optval_01K24WV2JY2PF9J6TBRT6VZ23G
variant_01K24WV2MYVB0J8MKRCWAFWK9Q	optval_01K24WV2JZ9WDH6JTNHV8QMJ5S
variant_01K24WV2MYMD3AHRJHXEG6T69D	optval_01K24WV2JZZ2GQQY9VDAGJE6CQ
variant_01K24WV2MY671ZJXHS5V9TMQ73	optval_01K24WV2JZ9BQD1YR75ZVWY602
variant_01K24WV2MYH9K6N0JBTV1DMADQ	optval_01K24WV2JZ07HYN23ZM9879ZSE
variant_01K24WV2MZ12N3E36NCD5J6NFB	optval_01K24WV2JZT6AEBCVPDP92WW2M
variant_01K24WV2MZD3HPW78M77GRA2BP	optval_01K24WV2JZTKBKB3YEK55QDM2K
variant_01K24WV2MZQ66HRWQDMZDJFG2K	optval_01K24WV2JZ2P74R8BTXHFSSTDW
variant_01K24WV2MZW926KQYR9A6B051W	optval_01K24WV2JZTYNF8NBCTGC5K6VJ
variant_01K24WV2MZA8KF38NM1W802D74	optval_01K24WV2K0VG77Y8YC47QYM5B7
variant_01K24WV2MZFYNJ8VSGEB2XV16R	optval_01K24WV2K00EPC7MYVJXQ1NJVY
variant_01K24WV2MZWDMNDSA33H1P121T	optval_01K24WV2K08A9M2QV6MRA3VMKG
variant_01K24WV2MZMW6TGM2JZEA1W437	optval_01K24WV2K001HM8GABECEHDC0K
\.


--
-- TOC entry 5438 (class 0 OID 163980)
-- Dependencies: 335
-- Data for Name: product_variant_price_set; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.product_variant_price_set (variant_id, price_set_id, id, created_at, updated_at, deleted_at) FROM stdin;
variant_01K24WV2MYECYCXY7N9N3AXDSE	pset_01K24WV2P80SRSFGWYDAKR425R	pvps_01K24WV2Q3JQ40F17WHEXKFEFV	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MYR9FS89871FW6EGA8	pset_01K24WV2P8VS0Z3HKT90AR3SGA	pvps_01K24WV2Q3EPGWHE7NKE2D59V4	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MYXK5935V9P1VWK7WB	pset_01K24WV2P8HQRYDKFN2X60ME07	pvps_01K24WV2Q3QDTMFG715T295MFT	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MYGNAGGGCG22B8P645	pset_01K24WV2P90W8MG6SCZ7G94EAX	pvps_01K24WV2Q3J4XB0RP12WM4S9KR	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MY8Z3GYC6M2MZ2S1T6	pset_01K24WV2P9TP27B7405ZKQT7T4	pvps_01K24WV2Q3T799WS0GFXFWJ9SK	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MYPXY9AJFC7EWJ19Y3	pset_01K24WV2P9E58Z7HK2EWRYKC3W	pvps_01K24WV2Q3ZKWAAWJT95ZX7H34	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MYGG9RT7K4QMGG524Z	pset_01K24WV2P93YQ5J8MWRAPH6MQK	pvps_01K24WV2Q3B9DDTV37XT2ZZ040	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MYCMBGJNTBDNSW4G5Q	pset_01K24WV2P9N9YB4AC1JY610JZC	pvps_01K24WV2Q4NX12T3SRHNWT3Y46	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MYVB0J8MKRCWAFWK9Q	pset_01K24WV2P99ZQ0HYGEJW5SN874	pvps_01K24WV2Q4FK12NWSN6KMKKSD4	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MYMD3AHRJHXEG6T69D	pset_01K24WV2P9526JRBXY7SXXZXYX	pvps_01K24WV2Q4EC2CXNFA1QE25VYJ	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MY671ZJXHS5V9TMQ73	pset_01K24WV2PAZJ6EBC9644NPR486	pvps_01K24WV2Q400N0660PAA7RHW0R	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MYH9K6N0JBTV1DMADQ	pset_01K24WV2PAP6C1MB7NSTQD5300	pvps_01K24WV2Q440A1C571JMHP56ES	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MZ12N3E36NCD5J6NFB	pset_01K24WV2PAARRHMT1ZDW4JQHSY	pvps_01K24WV2Q4M12V3MYETDF19YK1	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MZD3HPW78M77GRA2BP	pset_01K24WV2PAZY8Z218T29XWASDG	pvps_01K24WV2Q4DV5JNRJHVHTCTFQ6	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MZQ66HRWQDMZDJFG2K	pset_01K24WV2PADE034JRZTTXW5Z0Y	pvps_01K24WV2Q4P2862WKH4M6GD53T	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MZW926KQYR9A6B051W	pset_01K24WV2PADFYVBGRV6SV3BRQ0	pvps_01K24WV2Q4821YP7P2RQD7G8GA	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MZA8KF38NM1W802D74	pset_01K24WV2PAW6DSACWG7M2BC2EJ	pvps_01K24WV2Q4EYSBBCA5K3VT0Y7G	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MZFYNJ8VSGEB2XV16R	pset_01K24WV2PAHJQ8KGKW3MFCQ6T9	pvps_01K24WV2Q4VHEB5K1DP83Y18HD	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MZWDMNDSA33H1P121T	pset_01K24WV2PAA51BS830QTSDFB9C	pvps_01K24WV2Q4FT93DY2FBPYTR03Y	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
variant_01K24WV2MZMW6TGM2JZEA1W437	pset_01K24WV2PBV7GJWFY7ZZQ5A66P	pvps_01K24WV2Q4FJG8T9VWETJZ4J2D	2025-08-08 21:10:05.795408+08	2025-08-08 21:10:05.795408+08	\N
\.


--
-- TOC entry 5339 (class 0 OID 162200)
-- Dependencies: 236
-- Data for Name: promotion; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.promotion (id, code, campaign_id, is_automatic, type, created_at, updated_at, deleted_at, status, is_tax_inclusive) FROM stdin;
\.


--
-- TOC entry 5340 (class 0 OID 162215)
-- Dependencies: 237
-- Data for Name: promotion_application_method; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.promotion_application_method (id, value, raw_value, max_quantity, apply_to_quantity, buy_rules_min_quantity, type, target_type, allocation, promotion_id, created_at, updated_at, deleted_at, currency_code) FROM stdin;
\.


--
-- TOC entry 5337 (class 0 OID 162175)
-- Dependencies: 234
-- Data for Name: promotion_campaign; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.promotion_campaign (id, name, description, campaign_identifier, starts_at, ends_at, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5338 (class 0 OID 162186)
-- Dependencies: 235
-- Data for Name: promotion_campaign_budget; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.promotion_campaign_budget (id, type, campaign_id, "limit", raw_limit, used, raw_used, created_at, updated_at, deleted_at, currency_code) FROM stdin;
\.


--
-- TOC entry 5342 (class 0 OID 162244)
-- Dependencies: 239
-- Data for Name: promotion_promotion_rule; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.promotion_promotion_rule (promotion_id, promotion_rule_id) FROM stdin;
\.


--
-- TOC entry 5341 (class 0 OID 162232)
-- Dependencies: 238
-- Data for Name: promotion_rule; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.promotion_rule (id, description, attribute, operator, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5345 (class 0 OID 162265)
-- Dependencies: 242
-- Data for Name: promotion_rule_value; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.promotion_rule_value (id, promotion_rule_id, value, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5408 (class 0 OID 163519)
-- Dependencies: 305
-- Data for Name: provider_identity; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.provider_identity (id, entity_id, provider, auth_identity_id, user_metadata, provider_metadata, created_at, updated_at, deleted_at) FROM stdin;
01K24WHT4MNX8K593J2NQCX9SV	admin@test.com	emailpass	authid_01K24WHT4NC87YWMVAQQRBR8SC	\N	{"password": "c2NyeXB0AA8AAAAIAAAAASzq4uTFgKW+RC//hQUkd3Zu7Q+V6PBw7IVhnZoc4IWxtoLDOuQxRobVjeTnVjQtkM2aQlVo56djvkl8Qu67Kv6dsBhit26hGfd/r4mznVNa"}	2025-08-08 21:05:02.102+08	2025-08-08 21:05:02.102+08	\N
01K24YD44JPZH056QPQMJQX9BR	bboy10121988@gmail.com	emailpass	authid_01K24YD44JTM6NFGZ8G2XD1EFT	\N	{"password": "c2NyeXB0AA8AAAAIAAAAAcH8ZC7Q8FosP95Kg8i5NDEfuHx43Et73ofYoSc9Cx1IQmRQmT3vYtBr3Si85OdQYeTT9fZKepcNk918x1DTIbGkuJqOTys8zj9JGcwt/Dhv"}	2025-08-08 21:37:25.65+08	2025-08-08 21:37:25.65+08	\N
01K25V91KQ8TQGKG7HZ1QAVQ1S	admin@medusa-test.com	emailpass	authid_01K25V91KQKZ78YZN2M33MFCT2	\N	{"password": "c2NyeXB0AA8AAAAIAAAAAVhkEkNnvLvX6mDc8JfK9buxQjpCsAvsHGgGrxqpQ3nvRsygv2Z0NDPoP+dd6d+9tnlAoGsmbiyQCxohX23TWGL7Pc4izrCcYAfQV+77nubc"}	2025-08-09 06:02:00.696+08	2025-08-09 06:02:00.696+08	\N
\.


--
-- TOC entry 5439 (class 0 OID 164006)
-- Dependencies: 336
-- Data for Name: publishable_api_key_sales_channel; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.publishable_api_key_sales_channel (publishable_key_id, sales_channel_id, id, created_at, updated_at, deleted_at) FROM stdin;
apk_01K24WV2J2Q6CK7TWTFH58R5GF	sc_01K24WHT1DTGX58A570V7ZKBFQ	pksc_01K24WV2J7M5J5PBHHWP8HB1MC	2025-08-08 21:10:05.639121+08	2025-08-08 21:10:05.639121+08	\N
01J5C2Q0WNQJ8XRQHF8X8XQHF8	sc_01K24WHT1DTGX58A570V7ZKBFQ	paksc_53b04ac3e58d1559442c170af0	2025-08-09 13:47:55.485506+08	2025-08-09 13:47:55.485506+08	\N
\.


--
-- TOC entry 5375 (class 0 OID 162907)
-- Dependencies: 272
-- Data for Name: refund; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.refund (id, amount, raw_amount, payment_id, created_at, updated_at, deleted_at, created_by, metadata, refund_reason_id, note) FROM stdin;
\.


--
-- TOC entry 5377 (class 0 OID 162966)
-- Dependencies: 274
-- Data for Name: refund_reason; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.refund_reason (id, label, description, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5360 (class 0 OID 162695)
-- Dependencies: 257
-- Data for Name: region; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.region (id, name, currency_code, metadata, created_at, updated_at, deleted_at, automatic_taxes) FROM stdin;
reg_01K24WV2DDAE1HDAP5WSC3H6R3	United States	usd	\N	2025-08-08 21:10:05.493+08	2025-08-08 21:10:05.493+08	\N	t
reg_01K24WV2DDTY3K9DSET7GSYZ5D	Europe	eur	\N	2025-08-08 21:10:05.493+08	2025-08-08 21:10:05.493+08	\N	t
reg_01K24X0RS9F2Q0HE4AK13HCP33	Taiwan	twd	\N	2025-08-08 21:13:12.241+08	2025-08-08 21:13:12.241+08	\N	t
\.


--
-- TOC entry 5361 (class 0 OID 162706)
-- Dependencies: 258
-- Data for Name: region_country; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.region_country (iso_2, iso_3, num_code, name, display_name, region_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
af	afg	004	AFGHANISTAN	Afghanistan	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
al	alb	008	ALBANIA	Albania	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
dz	dza	012	ALGERIA	Algeria	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
as	asm	016	AMERICAN SAMOA	American Samoa	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
ad	and	020	ANDORRA	Andorra	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
ao	ago	024	ANGOLA	Angola	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
ai	aia	660	ANGUILLA	Anguilla	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
aq	ata	010	ANTARCTICA	Antarctica	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
ag	atg	028	ANTIGUA AND BARBUDA	Antigua and Barbuda	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
ar	arg	032	ARGENTINA	Argentina	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
am	arm	051	ARMENIA	Armenia	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
aw	abw	533	ARUBA	Aruba	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
au	aus	036	AUSTRALIA	Australia	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
at	aut	040	AUSTRIA	Austria	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
az	aze	031	AZERBAIJAN	Azerbaijan	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bs	bhs	044	BAHAMAS	Bahamas	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bh	bhr	048	BAHRAIN	Bahrain	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bd	bgd	050	BANGLADESH	Bangladesh	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bb	brb	052	BARBADOS	Barbados	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
by	blr	112	BELARUS	Belarus	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
be	bel	056	BELGIUM	Belgium	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bz	blz	084	BELIZE	Belize	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bj	ben	204	BENIN	Benin	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bm	bmu	060	BERMUDA	Bermuda	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bt	btn	064	BHUTAN	Bhutan	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bo	bol	068	BOLIVIA	Bolivia	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bq	bes	535	BONAIRE, SINT EUSTATIUS AND SABA	Bonaire, Sint Eustatius and Saba	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
ba	bih	070	BOSNIA AND HERZEGOVINA	Bosnia and Herzegovina	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bw	bwa	072	BOTSWANA	Botswana	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bv	bvd	074	BOUVET ISLAND	Bouvet Island	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
br	bra	076	BRAZIL	Brazil	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
io	iot	086	BRITISH INDIAN OCEAN TERRITORY	British Indian Ocean Territory	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bn	brn	096	BRUNEI DARUSSALAM	Brunei Darussalam	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bg	bgr	100	BULGARIA	Bulgaria	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bf	bfa	854	BURKINA FASO	Burkina Faso	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
bi	bdi	108	BURUNDI	Burundi	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
kh	khm	116	CAMBODIA	Cambodia	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cm	cmr	120	CAMEROON	Cameroon	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
ca	can	124	CANADA	Canada	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cv	cpv	132	CAPE VERDE	Cape Verde	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
ky	cym	136	CAYMAN ISLANDS	Cayman Islands	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cf	caf	140	CENTRAL AFRICAN REPUBLIC	Central African Republic	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
td	tcd	148	CHAD	Chad	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cl	chl	152	CHILE	Chile	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cn	chn	156	CHINA	China	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cx	cxr	162	CHRISTMAS ISLAND	Christmas Island	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cc	cck	166	COCOS (KEELING) ISLANDS	Cocos (Keeling) Islands	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
co	col	170	COLOMBIA	Colombia	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
km	com	174	COMOROS	Comoros	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cg	cog	178	CONGO	Congo	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cd	cod	180	CONGO, THE DEMOCRATIC REPUBLIC OF THE	Congo, the Democratic Republic of the	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
ck	cok	184	COOK ISLANDS	Cook Islands	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cr	cri	188	COSTA RICA	Costa Rica	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
ci	civ	384	COTE D'IVOIRE	Cote D'Ivoire	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
hr	hrv	191	CROATIA	Croatia	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cu	cub	192	CUBA	Cuba	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cw	cuw	531	CURAÇAO	Curaçao	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cy	cyp	196	CYPRUS	Cyprus	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
cz	cze	203	CZECH REPUBLIC	Czech Republic	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
dj	dji	262	DJIBOUTI	Djibouti	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
dm	dma	212	DOMINICA	Dominica	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
do	dom	214	DOMINICAN REPUBLIC	Dominican Republic	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
ec	ecu	218	ECUADOR	Ecuador	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
eg	egy	818	EGYPT	Egypt	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
sv	slv	222	EL SALVADOR	El Salvador	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
gq	gnq	226	EQUATORIAL GUINEA	Equatorial Guinea	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
er	eri	232	ERITREA	Eritrea	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
ee	est	233	ESTONIA	Estonia	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
et	eth	231	ETHIOPIA	Ethiopia	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
fk	flk	238	FALKLAND ISLANDS (MALVINAS)	Falkland Islands (Malvinas)	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
fo	fro	234	FAROE ISLANDS	Faroe Islands	\N	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:04:42.372+08	\N
fj	fji	242	FIJI	Fiji	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
fi	fin	246	FINLAND	Finland	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gf	guf	254	FRENCH GUIANA	French Guiana	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
pf	pyf	258	FRENCH POLYNESIA	French Polynesia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
tf	atf	260	FRENCH SOUTHERN TERRITORIES	French Southern Territories	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ga	gab	266	GABON	Gabon	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gm	gmb	270	GAMBIA	Gambia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ge	geo	268	GEORGIA	Georgia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gh	gha	288	GHANA	Ghana	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gi	gib	292	GIBRALTAR	Gibraltar	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gr	grc	300	GREECE	Greece	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gl	grl	304	GREENLAND	Greenland	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gd	grd	308	GRENADA	Grenada	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gp	glp	312	GUADELOUPE	Guadeloupe	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gu	gum	316	GUAM	Guam	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gt	gtm	320	GUATEMALA	Guatemala	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gg	ggy	831	GUERNSEY	Guernsey	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gn	gin	324	GUINEA	Guinea	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gw	gnb	624	GUINEA-BISSAU	Guinea-Bissau	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gy	guy	328	GUYANA	Guyana	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ht	hti	332	HAITI	Haiti	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
hm	hmd	334	HEARD ISLAND AND MCDONALD ISLANDS	Heard Island And Mcdonald Islands	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
va	vat	336	HOLY SEE (VATICAN CITY STATE)	Holy See (Vatican City State)	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
hn	hnd	340	HONDURAS	Honduras	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
hk	hkg	344	HONG KONG	Hong Kong	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
hu	hun	348	HUNGARY	Hungary	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
is	isl	352	ICELAND	Iceland	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
in	ind	356	INDIA	India	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
id	idn	360	INDONESIA	Indonesia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ir	irn	364	IRAN, ISLAMIC REPUBLIC OF	Iran, Islamic Republic of	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
iq	irq	368	IRAQ	Iraq	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ie	irl	372	IRELAND	Ireland	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
im	imn	833	ISLE OF MAN	Isle Of Man	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
il	isr	376	ISRAEL	Israel	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
jm	jam	388	JAMAICA	Jamaica	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
jp	jpn	392	JAPAN	Japan	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
je	jey	832	JERSEY	Jersey	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
jo	jor	400	JORDAN	Jordan	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
kz	kaz	398	KAZAKHSTAN	Kazakhstan	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ke	ken	404	KENYA	Kenya	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ki	kir	296	KIRIBATI	Kiribati	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
kp	prk	408	KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF	Korea, Democratic People's Republic of	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
kr	kor	410	KOREA, REPUBLIC OF	Korea, Republic of	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
xk	xkx	900	KOSOVO	Kosovo	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
kw	kwt	414	KUWAIT	Kuwait	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
kg	kgz	417	KYRGYZSTAN	Kyrgyzstan	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
la	lao	418	LAO PEOPLE'S DEMOCRATIC REPUBLIC	Lao People's Democratic Republic	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
lv	lva	428	LATVIA	Latvia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
lb	lbn	422	LEBANON	Lebanon	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ls	lso	426	LESOTHO	Lesotho	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
lr	lbr	430	LIBERIA	Liberia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ly	lby	434	LIBYA	Libya	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
li	lie	438	LIECHTENSTEIN	Liechtenstein	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
lt	ltu	440	LITHUANIA	Lithuania	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
lu	lux	442	LUXEMBOURG	Luxembourg	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mo	mac	446	MACAO	Macao	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mg	mdg	450	MADAGASCAR	Madagascar	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mw	mwi	454	MALAWI	Malawi	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
my	mys	458	MALAYSIA	Malaysia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mv	mdv	462	MALDIVES	Maldives	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ml	mli	466	MALI	Mali	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mt	mlt	470	MALTA	Malta	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mh	mhl	584	MARSHALL ISLANDS	Marshall Islands	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mq	mtq	474	MARTINIQUE	Martinique	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mr	mrt	478	MAURITANIA	Mauritania	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mu	mus	480	MAURITIUS	Mauritius	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
yt	myt	175	MAYOTTE	Mayotte	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mx	mex	484	MEXICO	Mexico	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
fm	fsm	583	MICRONESIA, FEDERATED STATES OF	Micronesia, Federated States of	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
md	mda	498	MOLDOVA, REPUBLIC OF	Moldova, Republic of	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mc	mco	492	MONACO	Monaco	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mn	mng	496	MONGOLIA	Mongolia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
me	mne	499	MONTENEGRO	Montenegro	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ms	msr	500	MONTSERRAT	Montserrat	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ma	mar	504	MOROCCO	Morocco	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mz	moz	508	MOZAMBIQUE	Mozambique	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mm	mmr	104	MYANMAR	Myanmar	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
na	nam	516	NAMIBIA	Namibia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
nr	nru	520	NAURU	Nauru	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
np	npl	524	NEPAL	Nepal	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
nl	nld	528	NETHERLANDS	Netherlands	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
nc	ncl	540	NEW CALEDONIA	New Caledonia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
nz	nzl	554	NEW ZEALAND	New Zealand	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ni	nic	558	NICARAGUA	Nicaragua	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ne	ner	562	NIGER	Niger	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ng	nga	566	NIGERIA	Nigeria	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
nu	niu	570	NIUE	Niue	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
nf	nfk	574	NORFOLK ISLAND	Norfolk Island	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mk	mkd	807	NORTH MACEDONIA	North Macedonia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mp	mnp	580	NORTHERN MARIANA ISLANDS	Northern Mariana Islands	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
no	nor	578	NORWAY	Norway	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
om	omn	512	OMAN	Oman	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
pk	pak	586	PAKISTAN	Pakistan	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
pw	plw	585	PALAU	Palau	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ps	pse	275	PALESTINIAN TERRITORY, OCCUPIED	Palestinian Territory, Occupied	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
pa	pan	591	PANAMA	Panama	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
pg	png	598	PAPUA NEW GUINEA	Papua New Guinea	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
py	pry	600	PARAGUAY	Paraguay	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
pe	per	604	PERU	Peru	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ph	phl	608	PHILIPPINES	Philippines	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
pn	pcn	612	PITCAIRN	Pitcairn	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
pl	pol	616	POLAND	Poland	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
pt	prt	620	PORTUGAL	Portugal	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
pr	pri	630	PUERTO RICO	Puerto Rico	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
qa	qat	634	QATAR	Qatar	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
re	reu	638	REUNION	Reunion	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ro	rom	642	ROMANIA	Romania	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ru	rus	643	RUSSIAN FEDERATION	Russian Federation	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
rw	rwa	646	RWANDA	Rwanda	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
bl	blm	652	SAINT BARTHÉLEMY	Saint Barthélemy	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sh	shn	654	SAINT HELENA	Saint Helena	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
kn	kna	659	SAINT KITTS AND NEVIS	Saint Kitts and Nevis	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
lc	lca	662	SAINT LUCIA	Saint Lucia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
mf	maf	663	SAINT MARTIN (FRENCH PART)	Saint Martin (French part)	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
pm	spm	666	SAINT PIERRE AND MIQUELON	Saint Pierre and Miquelon	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
vc	vct	670	SAINT VINCENT AND THE GRENADINES	Saint Vincent and the Grenadines	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ws	wsm	882	SAMOA	Samoa	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sm	smr	674	SAN MARINO	San Marino	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
st	stp	678	SAO TOME AND PRINCIPE	Sao Tome and Principe	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sa	sau	682	SAUDI ARABIA	Saudi Arabia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sn	sen	686	SENEGAL	Senegal	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
rs	srb	688	SERBIA	Serbia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sc	syc	690	SEYCHELLES	Seychelles	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sl	sle	694	SIERRA LEONE	Sierra Leone	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sg	sgp	702	SINGAPORE	Singapore	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sx	sxm	534	SINT MAARTEN	Sint Maarten	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sk	svk	703	SLOVAKIA	Slovakia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
si	svn	705	SLOVENIA	Slovenia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sb	slb	090	SOLOMON ISLANDS	Solomon Islands	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
so	som	706	SOMALIA	Somalia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
za	zaf	710	SOUTH AFRICA	South Africa	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
gs	sgs	239	SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS	South Georgia and the South Sandwich Islands	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ss	ssd	728	SOUTH SUDAN	South Sudan	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
lk	lka	144	SRI LANKA	Sri Lanka	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sd	sdn	729	SUDAN	Sudan	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sr	sur	740	SURINAME	Suriname	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sj	sjm	744	SVALBARD AND JAN MAYEN	Svalbard and Jan Mayen	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sz	swz	748	SWAZILAND	Swaziland	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ch	che	756	SWITZERLAND	Switzerland	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
sy	syr	760	SYRIAN ARAB REPUBLIC	Syrian Arab Republic	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
tj	tjk	762	TAJIKISTAN	Tajikistan	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
tz	tza	834	TANZANIA, UNITED REPUBLIC OF	Tanzania, United Republic of	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
th	tha	764	THAILAND	Thailand	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
tl	tls	626	TIMOR LESTE	Timor Leste	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
tg	tgo	768	TOGO	Togo	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
tk	tkl	772	TOKELAU	Tokelau	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
to	ton	776	TONGA	Tonga	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
tt	tto	780	TRINIDAD AND TOBAGO	Trinidad and Tobago	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
tn	tun	788	TUNISIA	Tunisia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
tr	tur	792	TURKEY	Turkey	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
tm	tkm	795	TURKMENISTAN	Turkmenistan	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
tc	tca	796	TURKS AND CAICOS ISLANDS	Turks and Caicos Islands	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
tv	tuv	798	TUVALU	Tuvalu	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ug	uga	800	UGANDA	Uganda	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ua	ukr	804	UKRAINE	Ukraine	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ae	are	784	UNITED ARAB EMIRATES	United Arab Emirates	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
um	umi	581	UNITED STATES MINOR OUTLYING ISLANDS	United States Minor Outlying Islands	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
uy	ury	858	URUGUAY	Uruguay	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
uz	uzb	860	UZBEKISTAN	Uzbekistan	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
vu	vut	548	VANUATU	Vanuatu	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ve	ven	862	VENEZUELA	Venezuela	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
vn	vnm	704	VIET NAM	Viet Nam	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
vg	vgb	092	VIRGIN ISLANDS, BRITISH	Virgin Islands, British	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
vi	vir	850	VIRGIN ISLANDS, U.S.	Virgin Islands, U.S.	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
wf	wlf	876	WALLIS AND FUTUNA	Wallis and Futuna	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
eh	esh	732	WESTERN SAHARA	Western Sahara	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ye	yem	887	YEMEN	Yemen	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
zm	zmb	894	ZAMBIA	Zambia	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
zw	zwe	716	ZIMBABWE	Zimbabwe	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
ax	ala	248	ÅLAND ISLANDS	Åland Islands	\N	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:04:42.373+08	\N
dk	dnk	208	DENMARK	Denmark	reg_01K24WV2DDTY3K9DSET7GSYZ5D	\N	2025-08-08 21:04:42.372+08	2025-08-08 21:10:05.493+08	\N
fr	fra	250	FRANCE	France	reg_01K24WV2DDTY3K9DSET7GSYZ5D	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:10:05.493+08	\N
de	deu	276	GERMANY	Germany	reg_01K24WV2DDTY3K9DSET7GSYZ5D	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:10:05.493+08	\N
it	ita	380	ITALY	Italy	reg_01K24WV2DDTY3K9DSET7GSYZ5D	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:10:05.493+08	\N
es	esp	724	SPAIN	Spain	reg_01K24WV2DDTY3K9DSET7GSYZ5D	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:10:05.493+08	\N
se	swe	752	SWEDEN	Sweden	reg_01K24WV2DDTY3K9DSET7GSYZ5D	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:10:05.493+08	\N
gb	gbr	826	UNITED KINGDOM	United Kingdom	reg_01K24WV2DDTY3K9DSET7GSYZ5D	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:10:05.493+08	\N
us	usa	840	UNITED STATES	United States	reg_01K24WV2DDAE1HDAP5WSC3H6R3	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:10:05.493+08	\N
tw	twn	158	TAIWAN, PROVINCE OF CHINA	Taiwan, Province of China	reg_01K24X0RS9F2Q0HE4AK13HCP33	\N	2025-08-08 21:04:42.373+08	2025-08-08 21:13:12.241+08	\N
\.


--
-- TOC entry 5440 (class 0 OID 164013)
-- Dependencies: 337
-- Data for Name: region_payment_provider; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.region_payment_provider (region_id, payment_provider_id, id, created_at, updated_at, deleted_at) FROM stdin;
reg_01K24WV2DDAE1HDAP5WSC3H6R3	pp_system_default	regpp_01K24WV2E6MVGWZ6Q8RB7YZAJW	2025-08-08 21:10:05.510109+08	2025-08-08 21:10:05.510109+08	\N
reg_01K24WV2DDTY3K9DSET7GSYZ5D	pp_system_default	regpp_01K24WV2E6TPD8J7H0MFFEAZG8	2025-08-08 21:10:05.510109+08	2025-08-08 21:10:05.510109+08	\N
reg_01K24X0RS9F2Q0HE4AK13HCP33	pp_system_default	regpp_01K24X0RT6NEM6156ZZ0EKKW0N	2025-08-08 21:13:12.262724+08	2025-08-08 21:13:12.262724+08	\N
\.


--
-- TOC entry 5318 (class 0 OID 161553)
-- Dependencies: 215
-- Data for Name: reservation_item; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.reservation_item (id, created_at, updated_at, deleted_at, line_item_id, location_id, quantity, external_id, description, created_by, metadata, inventory_item_id, allow_backorder, raw_quantity) FROM stdin;
\.


--
-- TOC entry 5397 (class 0 OID 163324)
-- Dependencies: 294
-- Data for Name: return; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.return (id, order_id, claim_id, exchange_id, order_version, display_id, status, no_notification, refund_amount, raw_refund_amount, metadata, created_at, updated_at, deleted_at, received_at, canceled_at, location_id, requested_at, created_by) FROM stdin;
\.


--
-- TOC entry 5435 (class 0 OID 163928)
-- Dependencies: 332
-- Data for Name: return_fulfillment; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.return_fulfillment (return_id, fulfillment_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5398 (class 0 OID 163339)
-- Dependencies: 295
-- Data for Name: return_item; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.return_item (id, return_id, reason_id, item_id, quantity, raw_quantity, received_quantity, raw_received_quantity, note, metadata, created_at, updated_at, deleted_at, damaged_quantity, raw_damaged_quantity) FROM stdin;
\.


--
-- TOC entry 5395 (class 0 OID 163218)
-- Dependencies: 292
-- Data for Name: return_reason; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.return_reason (id, value, label, description, metadata, parent_return_reason_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5350 (class 0 OID 162465)
-- Dependencies: 247
-- Data for Name: sales_channel; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.sales_channel (id, name, description, is_disabled, metadata, created_at, updated_at, deleted_at) FROM stdin;
sc_01K24WHT1DTGX58A570V7ZKBFQ	Default Sales Channel	Created by Medusa	f	\N	2025-08-08 21:05:01.997+08	2025-08-08 21:05:01.997+08	\N
\.


--
-- TOC entry 5441 (class 0 OID 164014)
-- Dependencies: 338
-- Data for Name: sales_channel_stock_location; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.sales_channel_stock_location (sales_channel_id, stock_location_id, id, created_at, updated_at, deleted_at) FROM stdin;
sc_01K24WHT1DTGX58A570V7ZKBFQ	sloc_01K24WV2ER5W9N9RV442CVJ8GB	scloc_01K24WV2HWHZK0VQKN5Z8KQFTR	2025-08-08 21:10:05.628292+08	2025-08-08 21:10:05.628292+08	\N
\.


--
-- TOC entry 5447 (class 0 OID 164105)
-- Dependencies: 344
-- Data for Name: script_migrations; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.script_migrations (id, script_name, created_at, finished_at) FROM stdin;
1	migrate-product-shipping-profile.js	2025-08-08 21:04:43.005951+08	2025-08-08 21:04:43.025318+08
2	migrate-tax-region-provider.js	2025-08-08 21:04:43.026798+08	2025-08-08 21:04:43.037562+08
\.


--
-- TOC entry 5414 (class 0 OID 163595)
-- Dependencies: 311
-- Data for Name: service_zone; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.service_zone (id, name, metadata, fulfillment_set_id, created_at, updated_at, deleted_at) FROM stdin;
serzo_01K24WV2F75SJWNTDH85CK7PXD	Europe	\N	fuset_01K24WV2F70B6YHNZ3R5WZ52SR	2025-08-08 21:10:05.543+08	2025-08-08 21:10:05.543+08	\N
\.


--
-- TOC entry 5418 (class 0 OID 163644)
-- Dependencies: 315
-- Data for Name: shipping_option; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.shipping_option (id, name, price_type, service_zone_id, shipping_profile_id, provider_id, data, metadata, shipping_option_type_id, created_at, updated_at, deleted_at) FROM stdin;
so_01K24WV2GDNP64XKBBNC4XDT1Y	Standard Shipping	flat	serzo_01K24WV2F75SJWNTDH85CK7PXD	sp_01K24WH7GD06AP9AMQ26X5P7QC	manual_manual	\N	\N	sotype_01K24WV2GDQA7PC4JJ0K0YD3P7	2025-08-08 21:10:05.581+08	2025-08-08 21:10:05.581+08	\N
so_01K24WV2GDY5SG10J9SGWFSN4P	Express Shipping	flat	serzo_01K24WV2F75SJWNTDH85CK7PXD	sp_01K24WH7GD06AP9AMQ26X5P7QC	manual_manual	\N	\N	sotype_01K24WV2GD41PEQSK5SKN3BCEC	2025-08-08 21:10:05.582+08	2025-08-08 21:10:05.582+08	\N
\.


--
-- TOC entry 5442 (class 0 OID 164019)
-- Dependencies: 339
-- Data for Name: shipping_option_price_set; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.shipping_option_price_set (shipping_option_id, price_set_id, id, created_at, updated_at, deleted_at) FROM stdin;
so_01K24WV2GDNP64XKBBNC4XDT1Y	pset_01K24WV2GVYAQPQN53ZGA5PJ2G	sops_01K24WV2HQA295V8K64N8M6F9N	2025-08-08 21:10:05.623838+08	2025-08-08 21:10:05.623838+08	\N
so_01K24WV2GDY5SG10J9SGWFSN4P	pset_01K24WV2GV823P05QQ4XBMAG55	sops_01K24WV2HRJ2XRFN0N0PXS9Q49	2025-08-08 21:10:05.623838+08	2025-08-08 21:10:05.623838+08	\N
\.


--
-- TOC entry 5419 (class 0 OID 163662)
-- Dependencies: 316
-- Data for Name: shipping_option_rule; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.shipping_option_rule (id, attribute, operator, value, shipping_option_id, created_at, updated_at, deleted_at) FROM stdin;
sorul_01K24WV2GDCMB1MAV6YNZA4BPC	enabled_in_store	eq	"true"	so_01K24WV2GDNP64XKBBNC4XDT1Y	2025-08-08 21:10:05.582+08	2025-08-08 21:10:05.582+08	\N
sorul_01K24WV2GD1HFXVQFK7ZMV14R2	is_return	eq	"false"	so_01K24WV2GDNP64XKBBNC4XDT1Y	2025-08-08 21:10:05.582+08	2025-08-08 21:10:05.582+08	\N
sorul_01K24WV2GD9SCQDCQJTF2KQD9Q	enabled_in_store	eq	"true"	so_01K24WV2GDY5SG10J9SGWFSN4P	2025-08-08 21:10:05.582+08	2025-08-08 21:10:05.582+08	\N
sorul_01K24WV2GD899BXXT5X2KCEZM7	is_return	eq	"false"	so_01K24WV2GDY5SG10J9SGWFSN4P	2025-08-08 21:10:05.582+08	2025-08-08 21:10:05.582+08	\N
\.


--
-- TOC entry 5416 (class 0 OID 163623)
-- Dependencies: 313
-- Data for Name: shipping_option_type; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.shipping_option_type (id, label, description, code, created_at, updated_at, deleted_at) FROM stdin;
sotype_01K24WV2GDQA7PC4JJ0K0YD3P7	Standard	Ship in 2-3 days.	standard	2025-08-08 21:10:05.581+08	2025-08-08 21:10:05.581+08	\N
sotype_01K24WV2GD41PEQSK5SKN3BCEC	Express	Ship in 24 hours.	express	2025-08-08 21:10:05.582+08	2025-08-08 21:10:05.582+08	\N
\.


--
-- TOC entry 5417 (class 0 OID 163633)
-- Dependencies: 314
-- Data for Name: shipping_profile; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.shipping_profile (id, name, type, metadata, created_at, updated_at, deleted_at) FROM stdin;
sp_01K24WH7GD06AP9AMQ26X5P7QC	Default Shipping Profile	default	\N	2025-08-08 21:04:43.022+08	2025-08-08 21:04:43.022+08	\N
\.


--
-- TOC entry 5315 (class 0 OID 161502)
-- Dependencies: 212
-- Data for Name: stock_location; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.stock_location (id, created_at, updated_at, deleted_at, name, address_id, metadata) FROM stdin;
sloc_01K24WV2ER5W9N9RV442CVJ8GB	2025-08-08 21:10:05.528+08	2025-08-08 21:10:05.528+08	\N	European Warehouse	laddr_01K24WV2ERMCY7VCM6Q0JFZAHH	\N
\.


--
-- TOC entry 5314 (class 0 OID 161492)
-- Dependencies: 211
-- Data for Name: stock_location_address; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.stock_location_address (id, created_at, updated_at, deleted_at, address_1, address_2, company, city, country_code, phone, province, postal_code, metadata) FROM stdin;
laddr_01K24WV2ERMCY7VCM6Q0JFZAHH	2025-08-08 21:10:05.528+08	2025-08-08 21:10:05.528+08	\N		\N	\N	Copenhagen	DK	\N	\N	\N	\N
\.


--
-- TOC entry 5363 (class 0 OID 162737)
-- Dependencies: 260
-- Data for Name: store; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.store (id, name, default_sales_channel_id, default_region_id, default_location_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
store_01K24WHT1NW06JRERCGECRBD5D	Medusa Store	sc_01K24WHT1DTGX58A570V7ZKBFQ	\N	\N	\N	2025-08-08 21:05:02.005223+08	2025-08-08 21:05:02.005223+08	\N
store_01J5C2Q0WNQJ8XRQHF8X8XQHF8	Tim's Fantasy World	sc_01K24WHT1DTGX58A570V7ZKBFQ	\N	\N	{}	2025-08-08 21:08:41.580295+08	2025-08-08 21:08:41.580295+08	\N
\.


--
-- TOC entry 5364 (class 0 OID 162749)
-- Dependencies: 261
-- Data for Name: store_currency; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.store_currency (id, currency_code, is_default, store_id, created_at, updated_at, deleted_at) FROM stdin;
stocur_01K24WHT1RSWVQ29PTW1KF8T1E	eur	t	store_01K24WHT1NW06JRERCGECRBD5D	2025-08-08 21:05:02.005223+08	2025-08-08 21:05:02.005223+08	\N
stocur_01K24X6Q4WN5FBKHFGKRK1P0EF	eur	f	store_01J5C2Q0WNQJ8XRQHF8X8XQHF8	2025-08-08 21:16:27.161254+08	2025-08-08 21:16:27.161254+08	\N
stocur_01K24X6Q4WWKDPTN3W5W0HBCM3	usd	f	store_01J5C2Q0WNQJ8XRQHF8X8XQHF8	2025-08-08 21:16:27.161254+08	2025-08-08 21:16:27.161254+08	\N
stocur_01K24X6Q4WARTASN2VK55HKHAN	twd	t	store_01J5C2Q0WNQJ8XRQHF8X8XQHF8	2025-08-08 21:16:27.161254+08	2025-08-08 21:16:27.161254+08	\N
\.


--
-- TOC entry 5365 (class 0 OID 162766)
-- Dependencies: 262
-- Data for Name: tax_provider; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.tax_provider (id, is_enabled, created_at, updated_at, deleted_at) FROM stdin;
tp_system	t	2025-08-08 21:04:42.38+08	2025-08-08 21:04:42.38+08	\N
\.


--
-- TOC entry 5367 (class 0 OID 162788)
-- Dependencies: 264
-- Data for Name: tax_rate; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.tax_rate (id, rate, code, name, is_default, is_combinable, tax_region_id, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- TOC entry 5368 (class 0 OID 162802)
-- Dependencies: 265
-- Data for Name: tax_rate_rule; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.tax_rate_rule (id, tax_rate_id, reference_id, reference, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- TOC entry 5366 (class 0 OID 162774)
-- Dependencies: 263
-- Data for Name: tax_region; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.tax_region (id, provider_id, country_code, province_code, parent_id, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
txreg_01K24WV2ECB5EVDKRVVBF248MV	tp_system	gb	\N	\N	\N	2025-08-08 21:10:05.516+08	2025-08-08 21:10:05.516+08	\N	\N
txreg_01K24WV2ECQ2Z27D5GM2SPXYZT	tp_system	de	\N	\N	\N	2025-08-08 21:10:05.517+08	2025-08-08 21:10:05.517+08	\N	\N
txreg_01K24WV2ECSFTKK0ZSKFS2DY01	tp_system	dk	\N	\N	\N	2025-08-08 21:10:05.517+08	2025-08-08 21:10:05.517+08	\N	\N
txreg_01K24WV2ECK4XA5TVCYMSZCF4V	tp_system	se	\N	\N	\N	2025-08-08 21:10:05.517+08	2025-08-08 21:10:05.517+08	\N	\N
txreg_01K24WV2ECZYQQG5XNB2YG7PS1	tp_system	fr	\N	\N	\N	2025-08-08 21:10:05.517+08	2025-08-08 21:10:05.517+08	\N	\N
txreg_01K24WV2ECBE6Y0S3HDY3XPPTW	tp_system	es	\N	\N	\N	2025-08-08 21:10:05.517+08	2025-08-08 21:10:05.517+08	\N	\N
txreg_01K24WV2ECVY3SQ8W0XR5GET06	tp_system	it	\N	\N	\N	2025-08-08 21:10:05.517+08	2025-08-08 21:10:05.517+08	\N	\N
txreg_01K24X0RTQ7XQBY1RM8433ZP91	tp_system	tw	\N	\N	\N	2025-08-08 21:13:12.279+08	2025-08-08 21:13:12.279+08	\N	\N
\.


--
-- TOC entry 5410 (class 0 OID 163552)
-- Dependencies: 307
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public."user" (id, first_name, last_name, email, avatar_url, metadata, created_at, updated_at, deleted_at) FROM stdin;
user_01K24WHT24MB62AGNCME64PECF	\N	\N	admin@test.com	\N	\N	2025-08-08 21:05:02.02+08	2025-08-08 21:05:02.02+08	\N
user_01K24YD428EYCE6EN4WWC0PZAJ	\N	\N	bboy10121988@gmail.com	\N	\N	2025-08-08 21:37:25.576+08	2025-08-08 21:37:25.576+08	\N
\.


--
-- TOC entry 5425 (class 0 OID 163834)
-- Dependencies: 322
-- Data for Name: workflow_execution; Type: TABLE DATA; Schema: public; Owner: raychou
--

COPY public.workflow_execution (id, workflow_id, transaction_id, execution, context, state, created_at, updated_at, deleted_at, retention_time, run_id) FROM stdin;
\.


--
-- TOC entry 5470 (class 0 OID 0)
-- Dependencies: 323
-- Name: link_module_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raychou
--

SELECT pg_catalog.setval('public.link_module_migrations_id_seq', 90, true);


--
-- TOC entry 5471 (class 0 OID 0)
-- Dependencies: 209
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raychou
--

SELECT pg_catalog.setval('public.mikro_orm_migrations_id_seq', 114, true);


--
-- TOC entry 5472 (class 0 OID 0)
-- Dependencies: 281
-- Name: order_change_action_ordering_seq; Type: SEQUENCE SET; Schema: public; Owner: raychou
--

SELECT pg_catalog.setval('public.order_change_action_ordering_seq', 1, false);


--
-- TOC entry 5473 (class 0 OID 0)
-- Dependencies: 299
-- Name: order_claim_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raychou
--

SELECT pg_catalog.setval('public.order_claim_display_id_seq', 1, false);


--
-- TOC entry 5474 (class 0 OID 0)
-- Dependencies: 277
-- Name: order_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raychou
--

SELECT pg_catalog.setval('public.order_display_id_seq', 1, false);


--
-- TOC entry 5475 (class 0 OID 0)
-- Dependencies: 296
-- Name: order_exchange_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raychou
--

SELECT pg_catalog.setval('public.order_exchange_display_id_seq', 1, false);


--
-- TOC entry 5476 (class 0 OID 0)
-- Dependencies: 293
-- Name: return_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raychou
--

SELECT pg_catalog.setval('public.return_display_id_seq', 1, false);


--
-- TOC entry 5477 (class 0 OID 0)
-- Dependencies: 343
-- Name: script_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: raychou
--

SELECT pg_catalog.setval('public.script_migrations_id_seq', 2, true);


--
-- TOC entry 4743 (class 2606 OID 163009)
-- Name: account_holder account_holder_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.account_holder
    ADD CONSTRAINT account_holder_pkey PRIMARY KEY (id);


--
-- TOC entry 5085 (class 2606 OID 169713)
-- Name: affiliate_click affiliate_click_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.affiliate_click
    ADD CONSTRAINT affiliate_click_pkey PRIMARY KEY (id);


--
-- TOC entry 5088 (class 2606 OID 169725)
-- Name: affiliate_conversion affiliate_conversion_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.affiliate_conversion
    ADD CONSTRAINT affiliate_conversion_pkey PRIMARY KEY (id);


--
-- TOC entry 5078 (class 2606 OID 164175)
-- Name: affiliate_partner affiliate_partner_email_key; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.affiliate_partner
    ADD CONSTRAINT affiliate_partner_email_key UNIQUE (email);


--
-- TOC entry 5080 (class 2606 OID 164173)
-- Name: affiliate_partner affiliate_partner_partner_code_key; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.affiliate_partner
    ADD CONSTRAINT affiliate_partner_partner_code_key UNIQUE (partner_code);


--
-- TOC entry 5082 (class 2606 OID 164171)
-- Name: affiliate_partner affiliate_partner_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.affiliate_partner
    ADD CONSTRAINT affiliate_partner_pkey PRIMARY KEY (id);


--
-- TOC entry 4678 (class 2606 OID 162730)
-- Name: api_key api_key_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.api_key
    ADD CONSTRAINT api_key_pkey PRIMARY KEY (id);


--
-- TOC entry 4583 (class 2606 OID 162264)
-- Name: application_method_buy_rules application_method_buy_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.application_method_buy_rules
    ADD CONSTRAINT application_method_buy_rules_pkey PRIMARY KEY (application_method_id, promotion_rule_id);


--
-- TOC entry 4581 (class 2606 OID 162257)
-- Name: application_method_target_rules application_method_target_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.application_method_target_rules
    ADD CONSTRAINT application_method_target_rules_pkey PRIMARY KEY (application_method_id, promotion_rule_id);


--
-- TOC entry 4870 (class 2606 OID 163516)
-- Name: auth_identity auth_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.auth_identity
    ADD CONSTRAINT auth_identity_pkey PRIMARY KEY (id);


--
-- TOC entry 4736 (class 2606 OID 162924)
-- Name: capture capture_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.capture
    ADD CONSTRAINT capture_pkey PRIMARY KEY (id);


--
-- TOC entry 4622 (class 2606 OID 162499)
-- Name: cart_address cart_address_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_address
    ADD CONSTRAINT cart_address_pkey PRIMARY KEY (id);


--
-- TOC entry 4636 (class 2606 OID 162535)
-- Name: cart_line_item_adjustment cart_line_item_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_line_item_adjustment
    ADD CONSTRAINT cart_line_item_adjustment_pkey PRIMARY KEY (id);


--
-- TOC entry 4630 (class 2606 OID 162512)
-- Name: cart_line_item cart_line_item_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_line_item
    ADD CONSTRAINT cart_line_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4642 (class 2606 OID 162546)
-- Name: cart_line_item_tax_line cart_line_item_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_line_item_tax_line
    ADD CONSTRAINT cart_line_item_tax_line_pkey PRIMARY KEY (id);


--
-- TOC entry 5061 (class 2606 OID 164074)
-- Name: cart_payment_collection cart_payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_payment_collection
    ADD CONSTRAINT cart_payment_collection_pkey PRIMARY KEY (cart_id, payment_collection_id);


--
-- TOC entry 4619 (class 2606 OID 162484)
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- TOC entry 4983 (class 2606 OID 163950)
-- Name: cart_promotion cart_promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_promotion
    ADD CONSTRAINT cart_promotion_pkey PRIMARY KEY (cart_id, promotion_id);


--
-- TOC entry 4654 (class 2606 OID 162570)
-- Name: cart_shipping_method_adjustment cart_shipping_method_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_shipping_method_adjustment
    ADD CONSTRAINT cart_shipping_method_adjustment_pkey PRIMARY KEY (id);


--
-- TOC entry 4648 (class 2606 OID 162559)
-- Name: cart_shipping_method cart_shipping_method_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_shipping_method
    ADD CONSTRAINT cart_shipping_method_pkey PRIMARY KEY (id);


--
-- TOC entry 4660 (class 2606 OID 162581)
-- Name: cart_shipping_method_tax_line cart_shipping_method_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_shipping_method_tax_line
    ADD CONSTRAINT cart_shipping_method_tax_line_pkey PRIMARY KEY (id);


--
-- TOC entry 4665 (class 2606 OID 162684)
-- Name: credit_line credit_line_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.credit_line
    ADD CONSTRAINT credit_line_pkey PRIMARY KEY (id);


--
-- TOC entry 4708 (class 2606 OID 162851)
-- Name: currency currency_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.currency
    ADD CONSTRAINT currency_pkey PRIMARY KEY (code);


--
-- TOC entry 5055 (class 2606 OID 164082)
-- Name: customer_account_holder customer_account_holder_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.customer_account_holder
    ADD CONSTRAINT customer_account_holder_pkey PRIMARY KEY (customer_id, account_holder_id);


--
-- TOC entry 4597 (class 2606 OID 162408)
-- Name: customer_address customer_address_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.customer_address
    ADD CONSTRAINT customer_address_pkey PRIMARY KEY (id);


--
-- TOC entry 4607 (class 2606 OID 162430)
-- Name: customer_group_customer customer_group_customer_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.customer_group_customer
    ADD CONSTRAINT customer_group_customer_pkey PRIMARY KEY (id);


--
-- TOC entry 4602 (class 2606 OID 162420)
-- Name: customer_group customer_group_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.customer_group
    ADD CONSTRAINT customer_group_pkey PRIMARY KEY (id);


--
-- TOC entry 4591 (class 2606 OID 162397)
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- TOC entry 4887 (class 2606 OID 163574)
-- Name: fulfillment_address fulfillment_address_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.fulfillment_address
    ADD CONSTRAINT fulfillment_address_pkey PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 163708)
-- Name: fulfillment_item fulfillment_item_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.fulfillment_item
    ADD CONSTRAINT fulfillment_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 2606 OID 163697)
-- Name: fulfillment_label fulfillment_label_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.fulfillment_label
    ADD CONSTRAINT fulfillment_label_pkey PRIMARY KEY (id);


--
-- TOC entry 4928 (class 2606 OID 163682)
-- Name: fulfillment fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_pkey PRIMARY KEY (id);


--
-- TOC entry 4890 (class 2606 OID 163583)
-- Name: fulfillment_provider fulfillment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.fulfillment_provider
    ADD CONSTRAINT fulfillment_provider_pkey PRIMARY KEY (id);


--
-- TOC entry 4894 (class 2606 OID 163592)
-- Name: fulfillment_set fulfillment_set_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.fulfillment_set
    ADD CONSTRAINT fulfillment_set_pkey PRIMARY KEY (id);


--
-- TOC entry 4906 (class 2606 OID 163617)
-- Name: geo_zone geo_zone_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.geo_zone
    ADD CONSTRAINT geo_zone_pkey PRIMARY KEY (id);


--
-- TOC entry 4494 (class 2606 OID 161693)
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- TOC entry 4451 (class 2606 OID 161535)
-- Name: inventory_item inventory_item_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.inventory_item
    ADD CONSTRAINT inventory_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4458 (class 2606 OID 161549)
-- Name: inventory_level inventory_level_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.inventory_level
    ADD CONSTRAINT inventory_level_pkey PRIMARY KEY (id);


--
-- TOC entry 4880 (class 2606 OID 163548)
-- Name: invite invite_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT invite_pkey PRIMARY KEY (id);


--
-- TOC entry 4957 (class 2606 OID 163866)
-- Name: link_module_migrations link_module_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.link_module_migrations
    ADD CONSTRAINT link_module_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4959 (class 2606 OID 163868)
-- Name: link_module_migrations link_module_migrations_table_name_key; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.link_module_migrations
    ADD CONSTRAINT link_module_migrations_table_name_key UNIQUE (table_name);


--
-- TOC entry 4977 (class 2606 OID 163910)
-- Name: location_fulfillment_provider location_fulfillment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.location_fulfillment_provider
    ADD CONSTRAINT location_fulfillment_provider_pkey PRIMARY KEY (stock_location_id, fulfillment_provider_id);


--
-- TOC entry 4965 (class 2606 OID 163923)
-- Name: location_fulfillment_set location_fulfillment_set_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.location_fulfillment_set
    ADD CONSTRAINT location_fulfillment_set_pkey PRIMARY KEY (stock_location_id, fulfillment_set_id);


--
-- TOC entry 4440 (class 2606 OID 161491)
-- Name: mikro_orm_migrations mikro_orm_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.mikro_orm_migrations
    ADD CONSTRAINT mikro_orm_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 163816)
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- TOC entry 4941 (class 2606 OID 163808)
-- Name: notification_provider notification_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.notification_provider
    ADD CONSTRAINT notification_provider_pkey PRIMARY KEY (id);


--
-- TOC entry 4747 (class 2606 OID 163032)
-- Name: order_address order_address_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_address
    ADD CONSTRAINT order_address_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 163926)
-- Name: order_cart order_cart_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_cart
    ADD CONSTRAINT order_cart_pkey PRIMARY KEY (order_id, cart_id);


--
-- TOC entry 4780 (class 2606 OID 163112)
-- Name: order_change_action order_change_action_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_change_action
    ADD CONSTRAINT order_change_action_pkey PRIMARY KEY (id);


--
-- TOC entry 4771 (class 2606 OID 163097)
-- Name: order_change order_change_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_change
    ADD CONSTRAINT order_change_pkey PRIMARY KEY (id);


--
-- TOC entry 4863 (class 2606 OID 163432)
-- Name: order_claim_item_image order_claim_item_image_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_claim_item_image
    ADD CONSTRAINT order_claim_item_image_pkey PRIMARY KEY (id);


--
-- TOC entry 4859 (class 2606 OID 163420)
-- Name: order_claim_item order_claim_item_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_claim_item
    ADD CONSTRAINT order_claim_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4854 (class 2606 OID 163397)
-- Name: order_claim order_claim_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_claim
    ADD CONSTRAINT order_claim_pkey PRIMARY KEY (id);


--
-- TOC entry 4867 (class 2606 OID 163490)
-- Name: order_credit_line order_credit_line_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_credit_line
    ADD CONSTRAINT order_credit_line_pkey PRIMARY KEY (id);


--
-- TOC entry 4848 (class 2606 OID 163377)
-- Name: order_exchange_item order_exchange_item_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_exchange_item
    ADD CONSTRAINT order_exchange_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4843 (class 2606 OID 163364)
-- Name: order_exchange order_exchange_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_exchange
    ADD CONSTRAINT order_exchange_pkey PRIMARY KEY (id);


--
-- TOC entry 4989 (class 2606 OID 163920)
-- Name: order_fulfillment order_fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_fulfillment
    ADD CONSTRAINT order_fulfillment_pkey PRIMARY KEY (order_id, fulfillment_id);


--
-- TOC entry 4786 (class 2606 OID 163124)
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4805 (class 2606 OID 163172)
-- Name: order_line_item_adjustment order_line_item_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_line_item_adjustment
    ADD CONSTRAINT order_line_item_adjustment_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 2606 OID 163151)
-- Name: order_line_item order_line_item_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_line_item
    ADD CONSTRAINT order_line_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4802 (class 2606 OID 163162)
-- Name: order_line_item_tax_line order_line_item_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_line_item_tax_line
    ADD CONSTRAINT order_line_item_tax_line_pkey PRIMARY KEY (id);


--
-- TOC entry 4995 (class 2606 OID 163927)
-- Name: order_payment_collection order_payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_payment_collection
    ADD CONSTRAINT order_payment_collection_pkey PRIMARY KEY (order_id, payment_collection_id);


--
-- TOC entry 4757 (class 2606 OID 163046)
-- Name: order order_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_pkey PRIMARY KEY (id);


--
-- TOC entry 5001 (class 2606 OID 163945)
-- Name: order_promotion order_promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_promotion
    ADD CONSTRAINT order_promotion_pkey PRIMARY KEY (order_id, promotion_id);


--
-- TOC entry 4811 (class 2606 OID 163193)
-- Name: order_shipping_method_adjustment order_shipping_method_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_shipping_method_adjustment
    ADD CONSTRAINT order_shipping_method_adjustment_pkey PRIMARY KEY (id);


--
-- TOC entry 4808 (class 2606 OID 163183)
-- Name: order_shipping_method order_shipping_method_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_shipping_method
    ADD CONSTRAINT order_shipping_method_pkey PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 163203)
-- Name: order_shipping_method_tax_line order_shipping_method_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_shipping_method_tax_line
    ADD CONSTRAINT order_shipping_method_tax_line_pkey PRIMARY KEY (id);


--
-- TOC entry 4795 (class 2606 OID 163136)
-- Name: order_shipping order_shipping_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_pkey PRIMARY KEY (id);


--
-- TOC entry 4761 (class 2606 OID 163085)
-- Name: order_summary order_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_summary
    ADD CONSTRAINT order_summary_pkey PRIMARY KEY (id);


--
-- TOC entry 4822 (class 2606 OID 163214)
-- Name: order_transaction order_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_transaction
    ADD CONSTRAINT order_transaction_pkey PRIMARY KEY (id);


--
-- TOC entry 4716 (class 2606 OID 162886)
-- Name: payment_collection_payment_providers payment_collection_payment_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.payment_collection_payment_providers
    ADD CONSTRAINT payment_collection_payment_providers_pkey PRIMARY KEY (payment_collection_id, payment_provider_id);


--
-- TOC entry 4711 (class 2606 OID 162862)
-- Name: payment_collection payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.payment_collection
    ADD CONSTRAINT payment_collection_pkey PRIMARY KEY (id);


--
-- TOC entry 4727 (class 2606 OID 162906)
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (id);


--
-- TOC entry 4714 (class 2606 OID 162879)
-- Name: payment_provider payment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.payment_provider
    ADD CONSTRAINT payment_provider_pkey PRIMARY KEY (id);


--
-- TOC entry 4720 (class 2606 OID 162897)
-- Name: payment_session payment_session_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.payment_session
    ADD CONSTRAINT payment_session_pkey PRIMARY KEY (id);


--
-- TOC entry 4539 (class 2606 OID 162036)
-- Name: price_list price_list_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.price_list
    ADD CONSTRAINT price_list_pkey PRIMARY KEY (id);


--
-- TOC entry 4544 (class 2606 OID 162045)
-- Name: price_list_rule price_list_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.price_list_rule
    ADD CONSTRAINT price_list_rule_pkey PRIMARY KEY (id);


--
-- TOC entry 4527 (class 2606 OID 161960)
-- Name: price price_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_pkey PRIMARY KEY (id);


--
-- TOC entry 4548 (class 2606 OID 162141)
-- Name: price_preference price_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.price_preference
    ADD CONSTRAINT price_preference_pkey PRIMARY KEY (id);


--
-- TOC entry 4536 (class 2606 OID 161991)
-- Name: price_rule price_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.price_rule
    ADD CONSTRAINT price_rule_pkey PRIMARY KEY (id);


--
-- TOC entry 4521 (class 2606 OID 161950)
-- Name: price_set price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.price_set
    ADD CONSTRAINT price_set_pkey PRIMARY KEY (id);


--
-- TOC entry 4512 (class 2606 OID 161741)
-- Name: product_category product_category_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_category
    ADD CONSTRAINT product_category_pkey PRIMARY KEY (id);


--
-- TOC entry 4516 (class 2606 OID 161765)
-- Name: product_category_product product_category_product_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_category_product
    ADD CONSTRAINT product_category_product_pkey PRIMARY KEY (product_id, product_category_id);


--
-- TOC entry 4507 (class 2606 OID 161726)
-- Name: product_collection product_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_collection
    ADD CONSTRAINT product_collection_pkey PRIMARY KEY (id);


--
-- TOC entry 4484 (class 2606 OID 161671)
-- Name: product_option product_option_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_option
    ADD CONSTRAINT product_option_pkey PRIMARY KEY (id);


--
-- TOC entry 4489 (class 2606 OID 161682)
-- Name: product_option_value product_option_value_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_option_value
    ADD CONSTRAINT product_option_value_pkey PRIMARY KEY (id);


--
-- TOC entry 4470 (class 2606 OID 161640)
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- TOC entry 5019 (class 2606 OID 163979)
-- Name: product_sales_channel product_sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_sales_channel
    ADD CONSTRAINT product_sales_channel_pkey PRIMARY KEY (product_id, sales_channel_id);


--
-- TOC entry 5067 (class 2606 OID 164085)
-- Name: product_shipping_profile product_shipping_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_shipping_profile
    ADD CONSTRAINT product_shipping_profile_pkey PRIMARY KEY (product_id, shipping_profile_id);


--
-- TOC entry 4498 (class 2606 OID 161704)
-- Name: product_tag product_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_tag
    ADD CONSTRAINT product_tag_pkey PRIMARY KEY (id);


--
-- TOC entry 4514 (class 2606 OID 161751)
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY (product_id, product_tag_id);


--
-- TOC entry 4502 (class 2606 OID 161715)
-- Name: product_type product_type_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_type
    ADD CONSTRAINT product_type_pkey PRIMARY KEY (id);


--
-- TOC entry 5013 (class 2606 OID 164000)
-- Name: product_variant_inventory_item product_variant_inventory_item_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_variant_inventory_item
    ADD CONSTRAINT product_variant_inventory_item_pkey PRIMARY KEY (variant_id, inventory_item_id);


--
-- TOC entry 4518 (class 2606 OID 161772)
-- Name: product_variant_option product_variant_option_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT product_variant_option_pkey PRIMARY KEY (variant_id, option_value_id);


--
-- TOC entry 4479 (class 2606 OID 161656)
-- Name: product_variant product_variant_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_variant
    ADD CONSTRAINT product_variant_pkey PRIMARY KEY (id);


--
-- TOC entry 5025 (class 2606 OID 163999)
-- Name: product_variant_price_set product_variant_price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_variant_price_set
    ADD CONSTRAINT product_variant_price_set_pkey PRIMARY KEY (variant_id, price_set_id);


--
-- TOC entry 4572 (class 2606 OID 162226)
-- Name: promotion_application_method promotion_application_method_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.promotion_application_method
    ADD CONSTRAINT promotion_application_method_pkey PRIMARY KEY (id);


--
-- TOC entry 4557 (class 2606 OID 162196)
-- Name: promotion_campaign_budget promotion_campaign_budget_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.promotion_campaign_budget
    ADD CONSTRAINT promotion_campaign_budget_pkey PRIMARY KEY (id);


--
-- TOC entry 4552 (class 2606 OID 162183)
-- Name: promotion_campaign promotion_campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.promotion_campaign
    ADD CONSTRAINT promotion_campaign_pkey PRIMARY KEY (id);


--
-- TOC entry 4564 (class 2606 OID 162210)
-- Name: promotion promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.promotion
    ADD CONSTRAINT promotion_pkey PRIMARY KEY (id);


--
-- TOC entry 4579 (class 2606 OID 162250)
-- Name: promotion_promotion_rule promotion_promotion_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.promotion_promotion_rule
    ADD CONSTRAINT promotion_promotion_rule_pkey PRIMARY KEY (promotion_id, promotion_rule_id);


--
-- TOC entry 4577 (class 2606 OID 162241)
-- Name: promotion_rule promotion_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.promotion_rule
    ADD CONSTRAINT promotion_rule_pkey PRIMARY KEY (id);


--
-- TOC entry 4587 (class 2606 OID 162273)
-- Name: promotion_rule_value promotion_rule_value_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.promotion_rule_value
    ADD CONSTRAINT promotion_rule_value_pkey PRIMARY KEY (id);


--
-- TOC entry 4875 (class 2606 OID 163527)
-- Name: provider_identity provider_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.provider_identity
    ADD CONSTRAINT provider_identity_pkey PRIMARY KEY (id);


--
-- TOC entry 5031 (class 2606 OID 164068)
-- Name: publishable_api_key_sales_channel publishable_api_key_sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.publishable_api_key_sales_channel
    ADD CONSTRAINT publishable_api_key_sales_channel_pkey PRIMARY KEY (publishable_key_id, sales_channel_id);


--
-- TOC entry 4732 (class 2606 OID 162915)
-- Name: refund refund_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.refund
    ADD CONSTRAINT refund_pkey PRIMARY KEY (id);


--
-- TOC entry 4739 (class 2606 OID 162974)
-- Name: refund_reason refund_reason_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.refund_reason
    ADD CONSTRAINT refund_reason_pkey PRIMARY KEY (id);


--
-- TOC entry 4673 (class 2606 OID 162712)
-- Name: region_country region_country_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.region_country
    ADD CONSTRAINT region_country_pkey PRIMARY KEY (iso_2);


--
-- TOC entry 5037 (class 2606 OID 164047)
-- Name: region_payment_provider region_payment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.region_payment_provider
    ADD CONSTRAINT region_payment_provider_pkey PRIMARY KEY (region_id, payment_provider_id);


--
-- TOC entry 4668 (class 2606 OID 162703)
-- Name: region region_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.region
    ADD CONSTRAINT region_pkey PRIMARY KEY (id);


--
-- TOC entry 4464 (class 2606 OID 161561)
-- Name: reservation_item reservation_item_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.reservation_item
    ADD CONSTRAINT reservation_item_pkey PRIMARY KEY (id);


--
-- TOC entry 5007 (class 2606 OID 163975)
-- Name: return_fulfillment return_fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.return_fulfillment
    ADD CONSTRAINT return_fulfillment_pkey PRIMARY KEY (return_id, fulfillment_id);


--
-- TOC entry 4837 (class 2606 OID 163348)
-- Name: return_item return_item_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.return_item
    ADD CONSTRAINT return_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 163334)
-- Name: return return_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.return
    ADD CONSTRAINT return_pkey PRIMARY KEY (id);


--
-- TOC entry 4825 (class 2606 OID 163226)
-- Name: return_reason return_reason_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.return_reason
    ADD CONSTRAINT return_reason_pkey PRIMARY KEY (id);


--
-- TOC entry 4610 (class 2606 OID 162474)
-- Name: sales_channel sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.sales_channel
    ADD CONSTRAINT sales_channel_pkey PRIMARY KEY (id);


--
-- TOC entry 5043 (class 2606 OID 164063)
-- Name: sales_channel_stock_location sales_channel_stock_location_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.sales_channel_stock_location
    ADD CONSTRAINT sales_channel_stock_location_pkey PRIMARY KEY (sales_channel_id, stock_location_id);


--
-- TOC entry 5070 (class 2606 OID 164111)
-- Name: script_migrations script_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.script_migrations
    ADD CONSTRAINT script_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4899 (class 2606 OID 163603)
-- Name: service_zone service_zone_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.service_zone
    ADD CONSTRAINT service_zone_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 163654)
-- Name: shipping_option shipping_option_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_pkey PRIMARY KEY (id);


--
-- TOC entry 5049 (class 2606 OID 164073)
-- Name: shipping_option_price_set shipping_option_price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.shipping_option_price_set
    ADD CONSTRAINT shipping_option_price_set_pkey PRIMARY KEY (shipping_option_id, price_set_id);


--
-- TOC entry 4923 (class 2606 OID 163671)
-- Name: shipping_option_rule shipping_option_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.shipping_option_rule
    ADD CONSTRAINT shipping_option_rule_pkey PRIMARY KEY (id);


--
-- TOC entry 4909 (class 2606 OID 163631)
-- Name: shipping_option_type shipping_option_type_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.shipping_option_type
    ADD CONSTRAINT shipping_option_type_pkey PRIMARY KEY (id);


--
-- TOC entry 4913 (class 2606 OID 163641)
-- Name: shipping_profile shipping_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.shipping_profile
    ADD CONSTRAINT shipping_profile_pkey PRIMARY KEY (id);


--
-- TOC entry 4443 (class 2606 OID 161500)
-- Name: stock_location_address stock_location_address_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.stock_location_address
    ADD CONSTRAINT stock_location_address_pkey PRIMARY KEY (id);


--
-- TOC entry 4447 (class 2606 OID 161510)
-- Name: stock_location stock_location_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.stock_location
    ADD CONSTRAINT stock_location_pkey PRIMARY KEY (id);


--
-- TOC entry 4685 (class 2606 OID 162758)
-- Name: store_currency store_currency_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.store_currency
    ADD CONSTRAINT store_currency_pkey PRIMARY KEY (id);


--
-- TOC entry 4681 (class 2606 OID 162747)
-- Name: store store_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.store
    ADD CONSTRAINT store_pkey PRIMARY KEY (id);


--
-- TOC entry 4688 (class 2606 OID 162773)
-- Name: tax_provider tax_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.tax_provider
    ADD CONSTRAINT tax_provider_pkey PRIMARY KEY (id);


--
-- TOC entry 4700 (class 2606 OID 162798)
-- Name: tax_rate tax_rate_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.tax_rate
    ADD CONSTRAINT tax_rate_pkey PRIMARY KEY (id);


--
-- TOC entry 4706 (class 2606 OID 162810)
-- Name: tax_rate_rule tax_rate_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.tax_rate_rule
    ADD CONSTRAINT tax_rate_rule_pkey PRIMARY KEY (id);


--
-- TOC entry 4695 (class 2606 OID 162784)
-- Name: tax_region tax_region_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.tax_region
    ADD CONSTRAINT tax_region_pkey PRIMARY KEY (id);


--
-- TOC entry 4884 (class 2606 OID 163560)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 163855)
-- Name: workflow_execution workflow_execution_pkey; Type: CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.workflow_execution
    ADD CONSTRAINT workflow_execution_pkey PRIMARY KEY (workflow_id, transaction_id, run_id);


--
-- TOC entry 4740 (class 1259 OID 163010)
-- Name: IDX_account_holder_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_account_holder_deleted_at" ON public.account_holder USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 5050 (class 1259 OID 164088)
-- Name: IDX_account_holder_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_account_holder_id_5cb3a0c0" ON public.customer_account_holder USING btree (account_holder_id);


--
-- TOC entry 4741 (class 1259 OID 163011)
-- Name: IDX_account_holder_provider_id_external_id_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_account_holder_provider_id_external_id_unique" ON public.account_holder USING btree (provider_id, external_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4631 (class 1259 OID 162536)
-- Name: IDX_adjustment_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_adjustment_item_id" ON public.cart_line_item_adjustment USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4649 (class 1259 OID 162571)
-- Name: IDX_adjustment_shipping_method_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_adjustment_shipping_method_id" ON public.cart_shipping_method_adjustment USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 5083 (class 1259 OID 169714)
-- Name: IDX_affiliate_click_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_affiliate_click_deleted_at" ON public.affiliate_click USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 5086 (class 1259 OID 169726)
-- Name: IDX_affiliate_conversion_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_affiliate_conversion_deleted_at" ON public.affiliate_conversion USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 5071 (class 1259 OID 169728)
-- Name: IDX_affiliate_partner_affiliate_code_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_affiliate_partner_affiliate_code_unique" ON public.affiliate_partner USING btree (affiliate_code) WHERE (deleted_at IS NULL);


--
-- TOC entry 5072 (class 1259 OID 164176)
-- Name: IDX_affiliate_partner_code; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_affiliate_partner_code" ON public.affiliate_partner USING btree (partner_code);


--
-- TOC entry 5073 (class 1259 OID 169729)
-- Name: IDX_affiliate_partner_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_affiliate_partner_deleted_at" ON public.affiliate_partner USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 5074 (class 1259 OID 164177)
-- Name: IDX_affiliate_partner_email; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_affiliate_partner_email" ON public.affiliate_partner USING btree (email);


--
-- TOC entry 5075 (class 1259 OID 169727)
-- Name: IDX_affiliate_partner_email_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_affiliate_partner_email_unique" ON public.affiliate_partner USING btree (email) WHERE (deleted_at IS NULL);


--
-- TOC entry 5076 (class 1259 OID 164178)
-- Name: IDX_affiliate_partner_status; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_affiliate_partner_status" ON public.affiliate_partner USING btree (status);


--
-- TOC entry 4674 (class 1259 OID 162736)
-- Name: IDX_api_key_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_api_key_deleted_at" ON public.api_key USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4675 (class 1259 OID 162731)
-- Name: IDX_api_key_token_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_api_key_token_unique" ON public.api_key USING btree (token);


--
-- TOC entry 4676 (class 1259 OID 162734)
-- Name: IDX_api_key_type; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_api_key_type" ON public.api_key USING btree (type);


--
-- TOC entry 4565 (class 1259 OID 162229)
-- Name: IDX_application_method_allocation; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_application_method_allocation" ON public.promotion_application_method USING btree (allocation);


--
-- TOC entry 4566 (class 1259 OID 162228)
-- Name: IDX_application_method_target_type; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_application_method_target_type" ON public.promotion_application_method USING btree (target_type);


--
-- TOC entry 4567 (class 1259 OID 162227)
-- Name: IDX_application_method_type; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_application_method_type" ON public.promotion_application_method USING btree (type);


--
-- TOC entry 4868 (class 1259 OID 163537)
-- Name: IDX_auth_identity_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_auth_identity_deleted_at" ON public.auth_identity USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4553 (class 1259 OID 162197)
-- Name: IDX_campaign_budget_type; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_campaign_budget_type" ON public.promotion_campaign_budget USING btree (type);


--
-- TOC entry 4733 (class 1259 OID 162981)
-- Name: IDX_capture_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_capture_deleted_at" ON public.capture USING btree (deleted_at);


--
-- TOC entry 4734 (class 1259 OID 162933)
-- Name: IDX_capture_payment_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_capture_payment_id" ON public.capture USING btree (payment_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4620 (class 1259 OID 162615)
-- Name: IDX_cart_address_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_address_deleted_at" ON public.cart_address USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4611 (class 1259 OID 162487)
-- Name: IDX_cart_billing_address_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_billing_address_id" ON public.cart USING btree (billing_address_id) WHERE ((deleted_at IS NULL) AND (billing_address_id IS NOT NULL));


--
-- TOC entry 4661 (class 1259 OID 162687)
-- Name: IDX_cart_credit_line_reference_reference_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_credit_line_reference_reference_id" ON public.credit_line USING btree (reference, reference_id) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4612 (class 1259 OID 162490)
-- Name: IDX_cart_currency_code; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_currency_code" ON public.cart USING btree (currency_code);


--
-- TOC entry 4613 (class 1259 OID 162485)
-- Name: IDX_cart_customer_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_customer_id" ON public.cart USING btree (customer_id) WHERE ((deleted_at IS NULL) AND (customer_id IS NOT NULL));


--
-- TOC entry 4614 (class 1259 OID 162614)
-- Name: IDX_cart_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_deleted_at" ON public.cart USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 5056 (class 1259 OID 164094)
-- Name: IDX_cart_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_id_-4a39f6c9" ON public.cart_payment_collection USING btree (cart_id);


--
-- TOC entry 4966 (class 1259 OID 163939)
-- Name: IDX_cart_id_-71069c16; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_id_-71069c16" ON public.order_cart USING btree (cart_id);


--
-- TOC entry 4978 (class 1259 OID 163976)
-- Name: IDX_cart_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_id_-a9d4a70b" ON public.cart_promotion USING btree (cart_id);


--
-- TOC entry 4632 (class 1259 OID 162616)
-- Name: IDX_cart_line_item_adjustment_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_line_item_adjustment_deleted_at" ON public.cart_line_item_adjustment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4633 (class 1259 OID 162640)
-- Name: IDX_cart_line_item_adjustment_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_line_item_adjustment_item_id" ON public.cart_line_item_adjustment USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4623 (class 1259 OID 162634)
-- Name: IDX_cart_line_item_cart_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_line_item_cart_id" ON public.cart_line_item USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4624 (class 1259 OID 162621)
-- Name: IDX_cart_line_item_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_line_item_deleted_at" ON public.cart_line_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4637 (class 1259 OID 162618)
-- Name: IDX_cart_line_item_tax_line_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_line_item_tax_line_deleted_at" ON public.cart_line_item_tax_line USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4638 (class 1259 OID 162646)
-- Name: IDX_cart_line_item_tax_line_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_line_item_tax_line_item_id" ON public.cart_line_item_tax_line USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4615 (class 1259 OID 162488)
-- Name: IDX_cart_region_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_region_id" ON public.cart USING btree (region_id) WHERE ((deleted_at IS NULL) AND (region_id IS NOT NULL));


--
-- TOC entry 4616 (class 1259 OID 162489)
-- Name: IDX_cart_sales_channel_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_sales_channel_id" ON public.cart USING btree (sales_channel_id) WHERE ((deleted_at IS NULL) AND (sales_channel_id IS NOT NULL));


--
-- TOC entry 4617 (class 1259 OID 162486)
-- Name: IDX_cart_shipping_address_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_shipping_address_id" ON public.cart USING btree (shipping_address_id) WHERE ((deleted_at IS NULL) AND (shipping_address_id IS NOT NULL));


--
-- TOC entry 4650 (class 1259 OID 162617)
-- Name: IDX_cart_shipping_method_adjustment_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_shipping_method_adjustment_deleted_at" ON public.cart_shipping_method_adjustment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4651 (class 1259 OID 162653)
-- Name: IDX_cart_shipping_method_adjustment_shipping_method_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_shipping_method_adjustment_shipping_method_id" ON public.cart_shipping_method_adjustment USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4643 (class 1259 OID 162652)
-- Name: IDX_cart_shipping_method_cart_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_shipping_method_cart_id" ON public.cart_shipping_method USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4644 (class 1259 OID 162620)
-- Name: IDX_cart_shipping_method_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_shipping_method_deleted_at" ON public.cart_shipping_method USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4655 (class 1259 OID 162619)
-- Name: IDX_cart_shipping_method_tax_line_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_shipping_method_tax_line_deleted_at" ON public.cart_shipping_method_tax_line USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4656 (class 1259 OID 162654)
-- Name: IDX_cart_shipping_method_tax_line_shipping_method_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_cart_shipping_method_tax_line_shipping_method_id" ON public.cart_shipping_method_tax_line USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4508 (class 1259 OID 161742)
-- Name: IDX_category_handle_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_category_handle_unique" ON public.product_category USING btree (handle) WHERE (deleted_at IS NULL);


--
-- TOC entry 4503 (class 1259 OID 161727)
-- Name: IDX_collection_handle_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_collection_handle_unique" ON public.product_collection USING btree (handle) WHERE (deleted_at IS NULL);


--
-- TOC entry 4662 (class 1259 OID 162685)
-- Name: IDX_credit_line_cart_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_credit_line_cart_id" ON public.credit_line USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4663 (class 1259 OID 162686)
-- Name: IDX_credit_line_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_credit_line_deleted_at" ON public.credit_line USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4592 (class 1259 OID 162409)
-- Name: IDX_customer_address_customer_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_customer_address_customer_id" ON public.customer_address USING btree (customer_id);


--
-- TOC entry 4593 (class 1259 OID 162451)
-- Name: IDX_customer_address_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_customer_address_deleted_at" ON public.customer_address USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4594 (class 1259 OID 162410)
-- Name: IDX_customer_address_unique_customer_billing; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_customer_address_unique_customer_billing" ON public.customer_address USING btree (customer_id) WHERE (is_default_billing = true);


--
-- TOC entry 4595 (class 1259 OID 162411)
-- Name: IDX_customer_address_unique_customer_shipping; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_customer_address_unique_customer_shipping" ON public.customer_address USING btree (customer_id) WHERE (is_default_shipping = true);


--
-- TOC entry 4588 (class 1259 OID 162450)
-- Name: IDX_customer_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_customer_deleted_at" ON public.customer USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4589 (class 1259 OID 162448)
-- Name: IDX_customer_email_has_account_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_customer_email_has_account_unique" ON public.customer USING btree (email, has_account) WHERE (deleted_at IS NULL);


--
-- TOC entry 4603 (class 1259 OID 162463)
-- Name: IDX_customer_group_customer_customer_group_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_customer_group_customer_customer_group_id" ON public.customer_group_customer USING btree (customer_group_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4604 (class 1259 OID 162432)
-- Name: IDX_customer_group_customer_customer_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_customer_group_customer_customer_id" ON public.customer_group_customer USING btree (customer_id);


--
-- TOC entry 4605 (class 1259 OID 162464)
-- Name: IDX_customer_group_customer_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_customer_group_customer_deleted_at" ON public.customer_group_customer USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4598 (class 1259 OID 162452)
-- Name: IDX_customer_group_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_customer_group_deleted_at" ON public.customer_group USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4599 (class 1259 OID 162421)
-- Name: IDX_customer_group_name; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_customer_group_name" ON public.customer_group USING btree (name) WHERE (deleted_at IS NULL);


--
-- TOC entry 4600 (class 1259 OID 162449)
-- Name: IDX_customer_group_name_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_customer_group_name_unique" ON public.customer_group USING btree (name) WHERE (deleted_at IS NULL);


--
-- TOC entry 5051 (class 1259 OID 164100)
-- Name: IDX_customer_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_customer_id_5cb3a0c0" ON public.customer_account_holder USING btree (customer_id);


--
-- TOC entry 5026 (class 1259 OID 164095)
-- Name: IDX_deleted_at_-1d67bae40; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (deleted_at);


--
-- TOC entry 4972 (class 1259 OID 163992)
-- Name: IDX_deleted_at_-1e5992737; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_-1e5992737" ON public.location_fulfillment_provider USING btree (deleted_at);


--
-- TOC entry 5002 (class 1259 OID 164007)
-- Name: IDX_deleted_at_-31ea43a; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_-31ea43a" ON public.return_fulfillment USING btree (deleted_at);


--
-- TOC entry 5057 (class 1259 OID 164098)
-- Name: IDX_deleted_at_-4a39f6c9; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_-4a39f6c9" ON public.cart_payment_collection USING btree (deleted_at);


--
-- TOC entry 4967 (class 1259 OID 163967)
-- Name: IDX_deleted_at_-71069c16; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_-71069c16" ON public.order_cart USING btree (deleted_at);


--
-- TOC entry 4996 (class 1259 OID 163993)
-- Name: IDX_deleted_at_-71518339; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_-71518339" ON public.order_promotion USING btree (deleted_at);


--
-- TOC entry 4979 (class 1259 OID 163988)
-- Name: IDX_deleted_at_-a9d4a70b; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_-a9d4a70b" ON public.cart_promotion USING btree (deleted_at);


--
-- TOC entry 4960 (class 1259 OID 163973)
-- Name: IDX_deleted_at_-e88adb96; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_-e88adb96" ON public.location_fulfillment_set USING btree (deleted_at);


--
-- TOC entry 4984 (class 1259 OID 163997)
-- Name: IDX_deleted_at_-e8d2543e; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_-e8d2543e" ON public.order_fulfillment USING btree (deleted_at);


--
-- TOC entry 5062 (class 1259 OID 164103)
-- Name: IDX_deleted_at_17a262437; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_17a262437" ON public.product_shipping_profile USING btree (deleted_at);


--
-- TOC entry 5008 (class 1259 OID 164032)
-- Name: IDX_deleted_at_17b4c4e35; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_17b4c4e35" ON public.product_variant_inventory_item USING btree (deleted_at);


--
-- TOC entry 5032 (class 1259 OID 164089)
-- Name: IDX_deleted_at_1c934dab0; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_1c934dab0" ON public.region_payment_provider USING btree (deleted_at);


--
-- TOC entry 5014 (class 1259 OID 164005)
-- Name: IDX_deleted_at_20b454295; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_20b454295" ON public.product_sales_channel USING btree (deleted_at);


--
-- TOC entry 5038 (class 1259 OID 164093)
-- Name: IDX_deleted_at_26d06f470; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_26d06f470" ON public.sales_channel_stock_location USING btree (deleted_at);


--
-- TOC entry 5020 (class 1259 OID 164044)
-- Name: IDX_deleted_at_52b23597; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_52b23597" ON public.product_variant_price_set USING btree (deleted_at);


--
-- TOC entry 5052 (class 1259 OID 164102)
-- Name: IDX_deleted_at_5cb3a0c0; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_5cb3a0c0" ON public.customer_account_holder USING btree (deleted_at);


--
-- TOC entry 5044 (class 1259 OID 164097)
-- Name: IDX_deleted_at_ba32fa9c; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_ba32fa9c" ON public.shipping_option_price_set USING btree (deleted_at);


--
-- TOC entry 4990 (class 1259 OID 163985)
-- Name: IDX_deleted_at_f42b9949; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_deleted_at_f42b9949" ON public.order_payment_collection USING btree (deleted_at);


--
-- TOC entry 4885 (class 1259 OID 163575)
-- Name: IDX_fulfillment_address_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_address_deleted_at" ON public.fulfillment_address USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4924 (class 1259 OID 163688)
-- Name: IDX_fulfillment_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_deleted_at" ON public.fulfillment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 5003 (class 1259 OID 163991)
-- Name: IDX_fulfillment_id_-31ea43a; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_id_-31ea43a" ON public.return_fulfillment USING btree (fulfillment_id);


--
-- TOC entry 4985 (class 1259 OID 163940)
-- Name: IDX_fulfillment_id_-e8d2543e; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_id_-e8d2543e" ON public.order_fulfillment USING btree (fulfillment_id);


--
-- TOC entry 4933 (class 1259 OID 163712)
-- Name: IDX_fulfillment_item_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_item_deleted_at" ON public.fulfillment_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4934 (class 1259 OID 163711)
-- Name: IDX_fulfillment_item_fulfillment_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_item_fulfillment_id" ON public.fulfillment_item USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4935 (class 1259 OID 163710)
-- Name: IDX_fulfillment_item_inventory_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_item_inventory_item_id" ON public.fulfillment_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4936 (class 1259 OID 163709)
-- Name: IDX_fulfillment_item_line_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_item_line_item_id" ON public.fulfillment_item USING btree (line_item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4929 (class 1259 OID 163699)
-- Name: IDX_fulfillment_label_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_label_deleted_at" ON public.fulfillment_label USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4930 (class 1259 OID 163698)
-- Name: IDX_fulfillment_label_fulfillment_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_label_fulfillment_id" ON public.fulfillment_label USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4925 (class 1259 OID 163685)
-- Name: IDX_fulfillment_location_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_location_id" ON public.fulfillment USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4888 (class 1259 OID 163779)
-- Name: IDX_fulfillment_provider_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_provider_deleted_at" ON public.fulfillment_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4973 (class 1259 OID 163929)
-- Name: IDX_fulfillment_provider_id_-1e5992737; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_provider_id_-1e5992737" ON public.location_fulfillment_provider USING btree (fulfillment_provider_id);


--
-- TOC entry 4891 (class 1259 OID 163594)
-- Name: IDX_fulfillment_set_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_set_deleted_at" ON public.fulfillment_set USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4961 (class 1259 OID 163933)
-- Name: IDX_fulfillment_set_id_-e88adb96; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_set_id_-e88adb96" ON public.location_fulfillment_set USING btree (fulfillment_set_id);


--
-- TOC entry 4892 (class 1259 OID 163593)
-- Name: IDX_fulfillment_set_name_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_fulfillment_set_name_unique" ON public.fulfillment_set USING btree (name) WHERE (deleted_at IS NULL);


--
-- TOC entry 4926 (class 1259 OID 163687)
-- Name: IDX_fulfillment_shipping_option_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_fulfillment_shipping_option_id" ON public.fulfillment USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4900 (class 1259 OID 163620)
-- Name: IDX_geo_zone_city; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_geo_zone_city" ON public.geo_zone USING btree (city) WHERE ((deleted_at IS NULL) AND (city IS NOT NULL));


--
-- TOC entry 4901 (class 1259 OID 163618)
-- Name: IDX_geo_zone_country_code; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_geo_zone_country_code" ON public.geo_zone USING btree (country_code) WHERE (deleted_at IS NULL);


--
-- TOC entry 4902 (class 1259 OID 163622)
-- Name: IDX_geo_zone_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_geo_zone_deleted_at" ON public.geo_zone USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4903 (class 1259 OID 163619)
-- Name: IDX_geo_zone_province_code; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_geo_zone_province_code" ON public.geo_zone USING btree (province_code) WHERE ((deleted_at IS NULL) AND (province_code IS NOT NULL));


--
-- TOC entry 4904 (class 1259 OID 163621)
-- Name: IDX_geo_zone_service_zone_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_geo_zone_service_zone_id" ON public.geo_zone USING btree (service_zone_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 5027 (class 1259 OID 164080)
-- Name: IDX_id_-1d67bae40; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (id);


--
-- TOC entry 4974 (class 1259 OID 163934)
-- Name: IDX_id_-1e5992737; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_-1e5992737" ON public.location_fulfillment_provider USING btree (id);


--
-- TOC entry 5004 (class 1259 OID 163998)
-- Name: IDX_id_-31ea43a; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_-31ea43a" ON public.return_fulfillment USING btree (id);


--
-- TOC entry 5058 (class 1259 OID 164090)
-- Name: IDX_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_-4a39f6c9" ON public.cart_payment_collection USING btree (id);


--
-- TOC entry 4968 (class 1259 OID 163946)
-- Name: IDX_id_-71069c16; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_-71069c16" ON public.order_cart USING btree (id);


--
-- TOC entry 4997 (class 1259 OID 163978)
-- Name: IDX_id_-71518339; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_-71518339" ON public.order_promotion USING btree (id);


--
-- TOC entry 4980 (class 1259 OID 163972)
-- Name: IDX_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_-a9d4a70b" ON public.cart_promotion USING btree (id);


--
-- TOC entry 4962 (class 1259 OID 163952)
-- Name: IDX_id_-e88adb96; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_-e88adb96" ON public.location_fulfillment_set USING btree (id);


--
-- TOC entry 4986 (class 1259 OID 163961)
-- Name: IDX_id_-e8d2543e; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_-e8d2543e" ON public.order_fulfillment USING btree (id);


--
-- TOC entry 5063 (class 1259 OID 164099)
-- Name: IDX_id_17a262437; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_17a262437" ON public.product_shipping_profile USING btree (id);


--
-- TOC entry 5009 (class 1259 OID 164010)
-- Name: IDX_id_17b4c4e35; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (id);


--
-- TOC entry 5033 (class 1259 OID 164071)
-- Name: IDX_id_1c934dab0; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_1c934dab0" ON public.region_payment_provider USING btree (id);


--
-- TOC entry 5015 (class 1259 OID 163994)
-- Name: IDX_id_20b454295; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_20b454295" ON public.product_sales_channel USING btree (id);


--
-- TOC entry 5039 (class 1259 OID 164076)
-- Name: IDX_id_26d06f470; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_26d06f470" ON public.sales_channel_stock_location USING btree (id);


--
-- TOC entry 5021 (class 1259 OID 164011)
-- Name: IDX_id_52b23597; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_52b23597" ON public.product_variant_price_set USING btree (id);


--
-- TOC entry 5053 (class 1259 OID 164096)
-- Name: IDX_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_5cb3a0c0" ON public.customer_account_holder USING btree (id);


--
-- TOC entry 5045 (class 1259 OID 164084)
-- Name: IDX_id_ba32fa9c; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_ba32fa9c" ON public.shipping_option_price_set USING btree (id);


--
-- TOC entry 4991 (class 1259 OID 163955)
-- Name: IDX_id_f42b9949; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_id_f42b9949" ON public.order_payment_collection USING btree (id);


--
-- TOC entry 4490 (class 1259 OID 161872)
-- Name: IDX_image_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_image_deleted_at" ON public.image USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4491 (class 1259 OID 161931)
-- Name: IDX_image_product_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_image_product_id" ON public.image USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4448 (class 1259 OID 161536)
-- Name: IDX_inventory_item_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_inventory_item_deleted_at" ON public.inventory_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 5010 (class 1259 OID 164003)
-- Name: IDX_inventory_item_id_17b4c4e35; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_inventory_item_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (inventory_item_id);


--
-- TOC entry 4449 (class 1259 OID 161624)
-- Name: IDX_inventory_item_sku; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_inventory_item_sku" ON public.inventory_item USING btree (sku) WHERE (deleted_at IS NULL);


--
-- TOC entry 4452 (class 1259 OID 161550)
-- Name: IDX_inventory_level_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_inventory_level_deleted_at" ON public.inventory_level USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4453 (class 1259 OID 161618)
-- Name: IDX_inventory_level_inventory_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_inventory_level_inventory_item_id" ON public.inventory_level USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4454 (class 1259 OID 161623)
-- Name: IDX_inventory_level_item_location; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_inventory_level_item_location" ON public.inventory_level USING btree (inventory_item_id, location_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4455 (class 1259 OID 161619)
-- Name: IDX_inventory_level_location_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_inventory_level_location_id" ON public.inventory_level USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4456 (class 1259 OID 161628)
-- Name: IDX_inventory_level_location_id_inventory_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_inventory_level_location_id_inventory_item_id" ON public.inventory_level USING btree (inventory_item_id, location_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4876 (class 1259 OID 163551)
-- Name: IDX_invite_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_invite_deleted_at" ON public.invite USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4877 (class 1259 OID 163564)
-- Name: IDX_invite_email_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_invite_email_unique" ON public.invite USING btree (email) WHERE (deleted_at IS NULL);


--
-- TOC entry 4878 (class 1259 OID 163550)
-- Name: IDX_invite_token; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_invite_token" ON public.invite USING btree (token) WHERE (deleted_at IS NULL);


--
-- TOC entry 4634 (class 1259 OID 162537)
-- Name: IDX_line_item_adjustment_promotion_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_line_item_adjustment_promotion_id" ON public.cart_line_item_adjustment USING btree (promotion_id) WHERE ((deleted_at IS NULL) AND (promotion_id IS NOT NULL));


--
-- TOC entry 4625 (class 1259 OID 162523)
-- Name: IDX_line_item_cart_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_line_item_cart_id" ON public.cart_line_item USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4626 (class 1259 OID 162524)
-- Name: IDX_line_item_product_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_line_item_product_id" ON public.cart_line_item USING btree (product_id) WHERE ((deleted_at IS NULL) AND (product_id IS NOT NULL));


--
-- TOC entry 4627 (class 1259 OID 162622)
-- Name: IDX_line_item_product_type_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_line_item_product_type_id" ON public.cart_line_item USING btree (product_type_id) WHERE ((deleted_at IS NULL) AND (product_type_id IS NOT NULL));


--
-- TOC entry 4639 (class 1259 OID 162548)
-- Name: IDX_line_item_tax_line_tax_rate_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_line_item_tax_line_tax_rate_id" ON public.cart_line_item_tax_line USING btree (tax_rate_id) WHERE ((deleted_at IS NULL) AND (tax_rate_id IS NOT NULL));


--
-- TOC entry 4628 (class 1259 OID 162525)
-- Name: IDX_line_item_variant_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_line_item_variant_id" ON public.cart_line_item USING btree (variant_id) WHERE ((deleted_at IS NULL) AND (variant_id IS NOT NULL));


--
-- TOC entry 4942 (class 1259 OID 163833)
-- Name: IDX_notification_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_notification_deleted_at" ON public.notification USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4943 (class 1259 OID 163829)
-- Name: IDX_notification_idempotency_key_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_notification_idempotency_key_unique" ON public.notification USING btree (idempotency_key) WHERE (deleted_at IS NULL);


--
-- TOC entry 4939 (class 1259 OID 163832)
-- Name: IDX_notification_provider_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_notification_provider_deleted_at" ON public.notification_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4944 (class 1259 OID 163817)
-- Name: IDX_notification_provider_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_notification_provider_id" ON public.notification USING btree (provider_id);


--
-- TOC entry 4945 (class 1259 OID 163819)
-- Name: IDX_notification_receiver_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_notification_receiver_id" ON public.notification USING btree (receiver_id);


--
-- TOC entry 4480 (class 1259 OID 161875)
-- Name: IDX_option_product_id_title_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_option_product_id_title_unique" ON public.product_option USING btree (product_id, title) WHERE (deleted_at IS NULL);


--
-- TOC entry 4485 (class 1259 OID 161683)
-- Name: IDX_option_value_option_id_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_option_value_option_id_unique" ON public.product_option_value USING btree (option_id, value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4744 (class 1259 OID 163033)
-- Name: IDX_order_address_customer_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_address_customer_id" ON public.order_address USING btree (customer_id);


--
-- TOC entry 4745 (class 1259 OID 163481)
-- Name: IDX_order_address_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_address_deleted_at" ON public.order_address USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4748 (class 1259 OID 163073)
-- Name: IDX_order_billing_address_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_billing_address_id" ON public."order" USING btree (billing_address_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4772 (class 1259 OID 163311)
-- Name: IDX_order_change_action_claim_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_action_claim_id" ON public.order_change_action USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4773 (class 1259 OID 163309)
-- Name: IDX_order_change_action_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_action_deleted_at" ON public.order_change_action USING btree (deleted_at);


--
-- TOC entry 4774 (class 1259 OID 163312)
-- Name: IDX_order_change_action_exchange_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_action_exchange_id" ON public.order_change_action USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4775 (class 1259 OID 163113)
-- Name: IDX_order_change_action_order_change_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_action_order_change_id" ON public.order_change_action USING btree (order_change_id);


--
-- TOC entry 4776 (class 1259 OID 163114)
-- Name: IDX_order_change_action_order_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_action_order_id" ON public.order_change_action USING btree (order_id);


--
-- TOC entry 4777 (class 1259 OID 163115)
-- Name: IDX_order_change_action_ordering; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_action_ordering" ON public.order_change_action USING btree (ordering);


--
-- TOC entry 4778 (class 1259 OID 163310)
-- Name: IDX_order_change_action_return_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_action_return_id" ON public.order_change_action USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4762 (class 1259 OID 163298)
-- Name: IDX_order_change_change_type; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_change_type" ON public.order_change USING btree (change_type);


--
-- TOC entry 4763 (class 1259 OID 163307)
-- Name: IDX_order_change_claim_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_claim_id" ON public.order_change USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4764 (class 1259 OID 163299)
-- Name: IDX_order_change_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_deleted_at" ON public.order_change USING btree (deleted_at);


--
-- TOC entry 4765 (class 1259 OID 163308)
-- Name: IDX_order_change_exchange_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_exchange_id" ON public.order_change USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4766 (class 1259 OID 163098)
-- Name: IDX_order_change_order_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_order_id" ON public.order_change USING btree (order_id);


--
-- TOC entry 4767 (class 1259 OID 163099)
-- Name: IDX_order_change_order_id_version; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_order_id_version" ON public.order_change USING btree (order_id, version);


--
-- TOC entry 4768 (class 1259 OID 163306)
-- Name: IDX_order_change_return_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_return_id" ON public.order_change USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4769 (class 1259 OID 163100)
-- Name: IDX_order_change_status; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_change_status" ON public.order_change USING btree (status);


--
-- TOC entry 4849 (class 1259 OID 163399)
-- Name: IDX_order_claim_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_claim_deleted_at" ON public.order_claim USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4850 (class 1259 OID 163398)
-- Name: IDX_order_claim_display_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_claim_display_id" ON public.order_claim USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4855 (class 1259 OID 163422)
-- Name: IDX_order_claim_item_claim_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_claim_item_claim_id" ON public.order_claim_item USING btree (claim_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4856 (class 1259 OID 163421)
-- Name: IDX_order_claim_item_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_claim_item_deleted_at" ON public.order_claim_item USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4860 (class 1259 OID 163433)
-- Name: IDX_order_claim_item_image_claim_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_claim_item_image_claim_item_id" ON public.order_claim_item_image USING btree (claim_item_id) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4861 (class 1259 OID 163434)
-- Name: IDX_order_claim_item_image_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_claim_item_image_deleted_at" ON public.order_claim_item_image USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4857 (class 1259 OID 163423)
-- Name: IDX_order_claim_item_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_claim_item_item_id" ON public.order_claim_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4851 (class 1259 OID 163400)
-- Name: IDX_order_claim_order_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_claim_order_id" ON public.order_claim USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4852 (class 1259 OID 163401)
-- Name: IDX_order_claim_return_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_claim_return_id" ON public.order_claim USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4864 (class 1259 OID 163492)
-- Name: IDX_order_credit_line_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_credit_line_deleted_at" ON public.order_credit_line USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4865 (class 1259 OID 163491)
-- Name: IDX_order_credit_line_order_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_credit_line_order_id" ON public.order_credit_line USING btree (order_id) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4749 (class 1259 OID 163071)
-- Name: IDX_order_currency_code; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_currency_code" ON public."order" USING btree (currency_code) WHERE (deleted_at IS NULL);


--
-- TOC entry 4750 (class 1259 OID 163070)
-- Name: IDX_order_customer_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_customer_id" ON public."order" USING btree (customer_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4751 (class 1259 OID 163074)
-- Name: IDX_order_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_deleted_at" ON public."order" USING btree (deleted_at);


--
-- TOC entry 4752 (class 1259 OID 163068)
-- Name: IDX_order_display_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_display_id" ON public."order" USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4838 (class 1259 OID 163366)
-- Name: IDX_order_exchange_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_exchange_deleted_at" ON public.order_exchange USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4839 (class 1259 OID 163365)
-- Name: IDX_order_exchange_display_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_exchange_display_id" ON public.order_exchange USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4844 (class 1259 OID 163378)
-- Name: IDX_order_exchange_item_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_exchange_item_deleted_at" ON public.order_exchange_item USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4845 (class 1259 OID 163379)
-- Name: IDX_order_exchange_item_exchange_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_exchange_item_exchange_id" ON public.order_exchange_item USING btree (exchange_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4846 (class 1259 OID 163380)
-- Name: IDX_order_exchange_item_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_exchange_item_item_id" ON public.order_exchange_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4840 (class 1259 OID 163367)
-- Name: IDX_order_exchange_order_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_exchange_order_id" ON public.order_exchange USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4841 (class 1259 OID 163368)
-- Name: IDX_order_exchange_return_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_exchange_return_id" ON public.order_exchange USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4969 (class 1259 OID 163953)
-- Name: IDX_order_id_-71069c16; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_id_-71069c16" ON public.order_cart USING btree (order_id);


--
-- TOC entry 4998 (class 1259 OID 163981)
-- Name: IDX_order_id_-71518339; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_id_-71518339" ON public.order_promotion USING btree (order_id);


--
-- TOC entry 4987 (class 1259 OID 163971)
-- Name: IDX_order_id_-e8d2543e; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_id_-e8d2543e" ON public.order_fulfillment USING btree (order_id);


--
-- TOC entry 4992 (class 1259 OID 163964)
-- Name: IDX_order_id_f42b9949; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_id_f42b9949" ON public.order_payment_collection USING btree (order_id);


--
-- TOC entry 4753 (class 1259 OID 163075)
-- Name: IDX_order_is_draft_order; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_is_draft_order" ON public."order" USING btree (is_draft_order) WHERE (deleted_at IS NULL);


--
-- TOC entry 4781 (class 1259 OID 163474)
-- Name: IDX_order_item_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_item_deleted_at" ON public.order_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4782 (class 1259 OID 163127)
-- Name: IDX_order_item_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_item_item_id" ON public.order_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4783 (class 1259 OID 163125)
-- Name: IDX_order_item_order_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_item_order_id" ON public.order_item USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4784 (class 1259 OID 163126)
-- Name: IDX_order_item_order_id_version; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_item_order_id_version" ON public.order_item USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- TOC entry 4803 (class 1259 OID 163441)
-- Name: IDX_order_line_item_adjustment_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_line_item_adjustment_item_id" ON public.order_line_item_adjustment USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4796 (class 1259 OID 163437)
-- Name: IDX_order_line_item_product_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_line_item_product_id" ON public.order_line_item USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4800 (class 1259 OID 163440)
-- Name: IDX_order_line_item_tax_line_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_line_item_tax_line_item_id" ON public.order_line_item_tax_line USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4797 (class 1259 OID 163436)
-- Name: IDX_order_line_item_variant_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_line_item_variant_id" ON public.order_line_item USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4754 (class 1259 OID 163069)
-- Name: IDX_order_region_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_region_id" ON public."order" USING btree (region_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4755 (class 1259 OID 163072)
-- Name: IDX_order_shipping_address_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_shipping_address_id" ON public."order" USING btree (shipping_address_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4787 (class 1259 OID 163304)
-- Name: IDX_order_shipping_claim_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_shipping_claim_id" ON public.order_shipping USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4788 (class 1259 OID 163476)
-- Name: IDX_order_shipping_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_shipping_deleted_at" ON public.order_shipping USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4789 (class 1259 OID 163305)
-- Name: IDX_order_shipping_exchange_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_shipping_exchange_id" ON public.order_shipping USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4790 (class 1259 OID 163139)
-- Name: IDX_order_shipping_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_shipping_item_id" ON public.order_shipping USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4809 (class 1259 OID 163439)
-- Name: IDX_order_shipping_method_adjustment_shipping_method_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_shipping_method_adjustment_shipping_method_id" ON public.order_shipping_method_adjustment USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4806 (class 1259 OID 163435)
-- Name: IDX_order_shipping_method_shipping_option_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_shipping_method_shipping_option_id" ON public.order_shipping_method USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4812 (class 1259 OID 163438)
-- Name: IDX_order_shipping_method_tax_line_shipping_method_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_shipping_method_tax_line_shipping_method_id" ON public.order_shipping_method_tax_line USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4791 (class 1259 OID 163137)
-- Name: IDX_order_shipping_order_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_shipping_order_id" ON public.order_shipping USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4792 (class 1259 OID 163138)
-- Name: IDX_order_shipping_order_id_version; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_shipping_order_id_version" ON public.order_shipping USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- TOC entry 4793 (class 1259 OID 163303)
-- Name: IDX_order_shipping_return_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_shipping_return_id" ON public.order_shipping USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4758 (class 1259 OID 163475)
-- Name: IDX_order_summary_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_summary_deleted_at" ON public.order_summary USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4759 (class 1259 OID 163086)
-- Name: IDX_order_summary_order_id_version; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_summary_order_id_version" ON public.order_summary USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- TOC entry 4815 (class 1259 OID 163301)
-- Name: IDX_order_transaction_claim_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_transaction_claim_id" ON public.order_transaction USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4816 (class 1259 OID 163216)
-- Name: IDX_order_transaction_currency_code; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_transaction_currency_code" ON public.order_transaction USING btree (currency_code) WHERE (deleted_at IS NULL);


--
-- TOC entry 4817 (class 1259 OID 163302)
-- Name: IDX_order_transaction_exchange_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_transaction_exchange_id" ON public.order_transaction USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4818 (class 1259 OID 163215)
-- Name: IDX_order_transaction_order_id_version; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_transaction_order_id_version" ON public.order_transaction USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- TOC entry 4819 (class 1259 OID 163217)
-- Name: IDX_order_transaction_reference_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_transaction_reference_id" ON public.order_transaction USING btree (reference_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4820 (class 1259 OID 163300)
-- Name: IDX_order_transaction_return_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_order_transaction_return_id" ON public.order_transaction USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4709 (class 1259 OID 162930)
-- Name: IDX_payment_collection_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_payment_collection_deleted_at" ON public.payment_collection USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 5059 (class 1259 OID 164079)
-- Name: IDX_payment_collection_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_payment_collection_id_-4a39f6c9" ON public.cart_payment_collection USING btree (payment_collection_id);


--
-- TOC entry 4993 (class 1259 OID 163936)
-- Name: IDX_payment_collection_id_f42b9949; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_payment_collection_id_f42b9949" ON public.order_payment_collection USING btree (payment_collection_id);


--
-- TOC entry 4721 (class 1259 OID 162925)
-- Name: IDX_payment_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_payment_deleted_at" ON public.payment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4722 (class 1259 OID 162926)
-- Name: IDX_payment_payment_collection_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_payment_payment_collection_id" ON public.payment USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4723 (class 1259 OID 162978)
-- Name: IDX_payment_payment_session_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_payment_payment_session_id" ON public.payment USING btree (payment_session_id);


--
-- TOC entry 4724 (class 1259 OID 162999)
-- Name: IDX_payment_payment_session_id_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_payment_payment_session_id_unique" ON public.payment USING btree (payment_session_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4712 (class 1259 OID 162985)
-- Name: IDX_payment_provider_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_payment_provider_deleted_at" ON public.payment_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4725 (class 1259 OID 162928)
-- Name: IDX_payment_provider_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_payment_provider_id" ON public.payment USING btree (provider_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 5034 (class 1259 OID 164059)
-- Name: IDX_payment_provider_id_1c934dab0; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_payment_provider_id_1c934dab0" ON public.region_payment_provider USING btree (payment_provider_id);


--
-- TOC entry 4717 (class 1259 OID 162977)
-- Name: IDX_payment_session_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_payment_session_deleted_at" ON public.payment_session USING btree (deleted_at);


--
-- TOC entry 4718 (class 1259 OID 162935)
-- Name: IDX_payment_session_payment_collection_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_payment_session_payment_collection_id" ON public.payment_session USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4522 (class 1259 OID 162121)
-- Name: IDX_price_currency_code; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_currency_code" ON public.price USING btree (currency_code) WHERE (deleted_at IS NULL);


--
-- TOC entry 4523 (class 1259 OID 162081)
-- Name: IDX_price_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_deleted_at" ON public.price USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4537 (class 1259 OID 162076)
-- Name: IDX_price_list_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_list_deleted_at" ON public.price_list USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4540 (class 1259 OID 162171)
-- Name: IDX_price_list_rule_attribute; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_list_rule_attribute" ON public.price_list_rule USING btree (attribute) WHERE (deleted_at IS NULL);


--
-- TOC entry 4541 (class 1259 OID 162093)
-- Name: IDX_price_list_rule_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_list_rule_deleted_at" ON public.price_list_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4542 (class 1259 OID 162092)
-- Name: IDX_price_list_rule_price_list_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_list_rule_price_list_id" ON public.price_list_rule USING btree (price_list_id) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4545 (class 1259 OID 162143)
-- Name: IDX_price_preference_attribute_value; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_price_preference_attribute_value" ON public.price_preference USING btree (attribute, value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4546 (class 1259 OID 162142)
-- Name: IDX_price_preference_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_preference_deleted_at" ON public.price_preference USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4524 (class 1259 OID 162080)
-- Name: IDX_price_price_list_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_price_list_id" ON public.price USING btree (price_list_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4525 (class 1259 OID 162078)
-- Name: IDX_price_price_set_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_price_set_id" ON public.price USING btree (price_set_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4528 (class 1259 OID 162174)
-- Name: IDX_price_rule_attribute; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_rule_attribute" ON public.price_rule USING btree (attribute) WHERE (deleted_at IS NULL);


--
-- TOC entry 4529 (class 1259 OID 162172)
-- Name: IDX_price_rule_attribute_value; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_rule_attribute_value" ON public.price_rule USING btree (attribute, value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4530 (class 1259 OID 162090)
-- Name: IDX_price_rule_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_rule_deleted_at" ON public.price_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4531 (class 1259 OID 162146)
-- Name: IDX_price_rule_operator; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_rule_operator" ON public.price_rule USING btree (operator);


--
-- TOC entry 4532 (class 1259 OID 162173)
-- Name: IDX_price_rule_operator_value; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_rule_operator_value" ON public.price_rule USING btree (operator, value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4533 (class 1259 OID 162170)
-- Name: IDX_price_rule_price_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_rule_price_id" ON public.price_rule USING btree (price_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4534 (class 1259 OID 162147)
-- Name: IDX_price_rule_price_id_attribute_operator_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_price_rule_price_id_attribute_operator_unique" ON public.price_rule USING btree (price_id, attribute, operator) WHERE (deleted_at IS NULL);


--
-- TOC entry 4519 (class 1259 OID 162077)
-- Name: IDX_price_set_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_set_deleted_at" ON public.price_set USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 5022 (class 1259 OID 164004)
-- Name: IDX_price_set_id_52b23597; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_set_id_52b23597" ON public.product_variant_price_set USING btree (price_set_id);


--
-- TOC entry 5046 (class 1259 OID 164077)
-- Name: IDX_price_set_id_ba32fa9c; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_price_set_id_ba32fa9c" ON public.shipping_option_price_set USING btree (price_set_id);


--
-- TOC entry 4504 (class 1259 OID 161744)
-- Name: IDX_product_category_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_category_deleted_at" ON public.product_collection USING btree (deleted_at);


--
-- TOC entry 4509 (class 1259 OID 161871)
-- Name: IDX_product_category_parent_category_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_category_parent_category_id" ON public.product_category USING btree (parent_category_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4510 (class 1259 OID 161743)
-- Name: IDX_product_category_path; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_category_path" ON public.product_category USING btree (mpath) WHERE (deleted_at IS NULL);


--
-- TOC entry 4505 (class 1259 OID 161728)
-- Name: IDX_product_collection_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_collection_deleted_at" ON public.product_collection USING btree (deleted_at);


--
-- TOC entry 4465 (class 1259 OID 161643)
-- Name: IDX_product_collection_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_collection_id" ON public.product USING btree (collection_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4466 (class 1259 OID 161644)
-- Name: IDX_product_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_deleted_at" ON public.product USING btree (deleted_at);


--
-- TOC entry 4467 (class 1259 OID 161641)
-- Name: IDX_product_handle_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_product_handle_unique" ON public.product USING btree (handle) WHERE (deleted_at IS NULL);


--
-- TOC entry 5064 (class 1259 OID 164101)
-- Name: IDX_product_id_17a262437; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_id_17a262437" ON public.product_shipping_profile USING btree (product_id);


--
-- TOC entry 5016 (class 1259 OID 164001)
-- Name: IDX_product_id_20b454295; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_id_20b454295" ON public.product_sales_channel USING btree (product_id);


--
-- TOC entry 4492 (class 1259 OID 161694)
-- Name: IDX_product_image_url; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_image_url" ON public.image USING btree (url) WHERE (deleted_at IS NULL);


--
-- TOC entry 4481 (class 1259 OID 161673)
-- Name: IDX_product_option_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_option_deleted_at" ON public.product_option USING btree (deleted_at);


--
-- TOC entry 4482 (class 1259 OID 161881)
-- Name: IDX_product_option_product_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_option_product_id" ON public.product_option USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4486 (class 1259 OID 161684)
-- Name: IDX_product_option_value_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_option_value_deleted_at" ON public.product_option_value USING btree (deleted_at);


--
-- TOC entry 4487 (class 1259 OID 161882)
-- Name: IDX_product_option_value_option_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_option_value_option_id" ON public.product_option_value USING btree (option_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4495 (class 1259 OID 161706)
-- Name: IDX_product_tag_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_tag_deleted_at" ON public.product_tag USING btree (deleted_at);


--
-- TOC entry 4499 (class 1259 OID 161717)
-- Name: IDX_product_type_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_type_deleted_at" ON public.product_type USING btree (deleted_at);


--
-- TOC entry 4468 (class 1259 OID 161642)
-- Name: IDX_product_type_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_type_id" ON public.product USING btree (type_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4471 (class 1259 OID 161660)
-- Name: IDX_product_variant_barcode_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_product_variant_barcode_unique" ON public.product_variant USING btree (barcode) WHERE (deleted_at IS NULL);


--
-- TOC entry 4472 (class 1259 OID 161662)
-- Name: IDX_product_variant_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_variant_deleted_at" ON public.product_variant USING btree (deleted_at);


--
-- TOC entry 4473 (class 1259 OID 161657)
-- Name: IDX_product_variant_ean_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_product_variant_ean_unique" ON public.product_variant USING btree (ean) WHERE (deleted_at IS NULL);


--
-- TOC entry 4474 (class 1259 OID 161932)
-- Name: IDX_product_variant_id_product_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_variant_id_product_id" ON public.product_variant USING btree (id, product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4475 (class 1259 OID 161661)
-- Name: IDX_product_variant_product_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_product_variant_product_id" ON public.product_variant USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4476 (class 1259 OID 161659)
-- Name: IDX_product_variant_sku_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_product_variant_sku_unique" ON public.product_variant USING btree (sku) WHERE (deleted_at IS NULL);


--
-- TOC entry 4477 (class 1259 OID 161658)
-- Name: IDX_product_variant_upc_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_product_variant_upc_unique" ON public.product_variant USING btree (upc) WHERE (deleted_at IS NULL);


--
-- TOC entry 4568 (class 1259 OID 162331)
-- Name: IDX_promotion_application_method_currency_code; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_application_method_currency_code" ON public.promotion_application_method USING btree (currency_code) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4569 (class 1259 OID 162377)
-- Name: IDX_promotion_application_method_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_application_method_deleted_at" ON public.promotion_application_method USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4570 (class 1259 OID 162385)
-- Name: IDX_promotion_application_method_promotion_id_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_promotion_application_method_promotion_id_unique" ON public.promotion_application_method USING btree (promotion_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4554 (class 1259 OID 162384)
-- Name: IDX_promotion_campaign_budget_campaign_id_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_budget_campaign_id_unique" ON public.promotion_campaign_budget USING btree (campaign_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4555 (class 1259 OID 162340)
-- Name: IDX_promotion_campaign_budget_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_campaign_budget_deleted_at" ON public.promotion_campaign_budget USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4549 (class 1259 OID 162332)
-- Name: IDX_promotion_campaign_campaign_identifier_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_campaign_identifier_unique" ON public.promotion_campaign USING btree (campaign_identifier) WHERE (deleted_at IS NULL);


--
-- TOC entry 4550 (class 1259 OID 162333)
-- Name: IDX_promotion_campaign_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_campaign_deleted_at" ON public.promotion_campaign USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4558 (class 1259 OID 162341)
-- Name: IDX_promotion_campaign_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_campaign_id" ON public.promotion USING btree (campaign_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4559 (class 1259 OID 162342)
-- Name: IDX_promotion_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_deleted_at" ON public.promotion USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4999 (class 1259 OID 163970)
-- Name: IDX_promotion_id_-71518339; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_id_-71518339" ON public.order_promotion USING btree (promotion_id);


--
-- TOC entry 4981 (class 1259 OID 163962)
-- Name: IDX_promotion_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_id_-a9d4a70b" ON public.cart_promotion USING btree (promotion_id);


--
-- TOC entry 4573 (class 1259 OID 162242)
-- Name: IDX_promotion_rule_attribute; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_rule_attribute" ON public.promotion_rule USING btree (attribute);


--
-- TOC entry 4574 (class 1259 OID 162378)
-- Name: IDX_promotion_rule_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_rule_deleted_at" ON public.promotion_rule USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4575 (class 1259 OID 162243)
-- Name: IDX_promotion_rule_operator; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_rule_operator" ON public.promotion_rule USING btree (operator);


--
-- TOC entry 4584 (class 1259 OID 162380)
-- Name: IDX_promotion_rule_value_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_rule_value_deleted_at" ON public.promotion_rule_value USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4585 (class 1259 OID 162379)
-- Name: IDX_promotion_rule_value_promotion_rule_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_rule_value_promotion_rule_id" ON public.promotion_rule_value USING btree (promotion_rule_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4560 (class 1259 OID 162383)
-- Name: IDX_promotion_status; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_status" ON public.promotion USING btree (status) WHERE (deleted_at IS NULL);


--
-- TOC entry 4561 (class 1259 OID 162212)
-- Name: IDX_promotion_type; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_promotion_type" ON public.promotion USING btree (type);


--
-- TOC entry 4871 (class 1259 OID 163528)
-- Name: IDX_provider_identity_auth_identity_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_provider_identity_auth_identity_id" ON public.provider_identity USING btree (auth_identity_id);


--
-- TOC entry 4872 (class 1259 OID 163538)
-- Name: IDX_provider_identity_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_provider_identity_deleted_at" ON public.provider_identity USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4873 (class 1259 OID 163529)
-- Name: IDX_provider_identity_provider_entity_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_provider_identity_provider_entity_id" ON public.provider_identity USING btree (entity_id, provider);


--
-- TOC entry 5028 (class 1259 OID 164086)
-- Name: IDX_publishable_key_id_-1d67bae40; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_publishable_key_id_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (publishable_key_id);


--
-- TOC entry 4728 (class 1259 OID 162982)
-- Name: IDX_refund_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_refund_deleted_at" ON public.refund USING btree (deleted_at);


--
-- TOC entry 4729 (class 1259 OID 162931)
-- Name: IDX_refund_payment_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_refund_payment_id" ON public.refund USING btree (payment_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4737 (class 1259 OID 162997)
-- Name: IDX_refund_reason_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_refund_reason_deleted_at" ON public.refund_reason USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4730 (class 1259 OID 162998)
-- Name: IDX_refund_refund_reason_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_refund_refund_reason_id" ON public.refund USING btree (refund_reason_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4669 (class 1259 OID 162722)
-- Name: IDX_region_country_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_region_country_deleted_at" ON public.region_country USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4670 (class 1259 OID 162721)
-- Name: IDX_region_country_region_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_region_country_region_id" ON public.region_country USING btree (region_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4671 (class 1259 OID 162713)
-- Name: IDX_region_country_region_id_iso_2_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_region_country_region_id_iso_2_unique" ON public.region_country USING btree (region_id, iso_2);


--
-- TOC entry 4666 (class 1259 OID 162705)
-- Name: IDX_region_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_region_deleted_at" ON public.region USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 5035 (class 1259 OID 164083)
-- Name: IDX_region_id_1c934dab0; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_region_id_1c934dab0" ON public.region_payment_provider USING btree (region_id);


--
-- TOC entry 4459 (class 1259 OID 161563)
-- Name: IDX_reservation_item_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_reservation_item_deleted_at" ON public.reservation_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4460 (class 1259 OID 161622)
-- Name: IDX_reservation_item_inventory_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_reservation_item_inventory_item_id" ON public.reservation_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4461 (class 1259 OID 161620)
-- Name: IDX_reservation_item_line_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_reservation_item_line_item_id" ON public.reservation_item USING btree (line_item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4462 (class 1259 OID 161621)
-- Name: IDX_reservation_item_location_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_reservation_item_location_id" ON public.reservation_item USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4826 (class 1259 OID 163336)
-- Name: IDX_return_claim_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_return_claim_id" ON public.return USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4827 (class 1259 OID 163338)
-- Name: IDX_return_display_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_return_display_id" ON public.return USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4828 (class 1259 OID 163337)
-- Name: IDX_return_exchange_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_return_exchange_id" ON public.return USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 5005 (class 1259 OID 164002)
-- Name: IDX_return_id_-31ea43a; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_return_id_-31ea43a" ON public.return_fulfillment USING btree (return_id);


--
-- TOC entry 4832 (class 1259 OID 163349)
-- Name: IDX_return_item_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_return_item_deleted_at" ON public.return_item USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4833 (class 1259 OID 163351)
-- Name: IDX_return_item_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_return_item_item_id" ON public.return_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4834 (class 1259 OID 163352)
-- Name: IDX_return_item_reason_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_return_item_reason_id" ON public.return_item USING btree (reason_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4835 (class 1259 OID 163350)
-- Name: IDX_return_item_return_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_return_item_return_id" ON public.return_item USING btree (return_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4829 (class 1259 OID 163335)
-- Name: IDX_return_order_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_return_order_id" ON public.return USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4823 (class 1259 OID 163232)
-- Name: IDX_return_reason_value; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_return_reason_value" ON public.return_reason USING btree (value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4608 (class 1259 OID 162475)
-- Name: IDX_sales_channel_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_sales_channel_deleted_at" ON public.sales_channel USING btree (deleted_at);


--
-- TOC entry 5029 (class 1259 OID 164075)
-- Name: IDX_sales_channel_id_-1d67bae40; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_sales_channel_id_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (sales_channel_id);


--
-- TOC entry 5017 (class 1259 OID 163989)
-- Name: IDX_sales_channel_id_20b454295; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_sales_channel_id_20b454295" ON public.product_sales_channel USING btree (sales_channel_id);


--
-- TOC entry 5040 (class 1259 OID 164087)
-- Name: IDX_sales_channel_id_26d06f470; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_sales_channel_id_26d06f470" ON public.sales_channel_stock_location USING btree (sales_channel_id);


--
-- TOC entry 4895 (class 1259 OID 163606)
-- Name: IDX_service_zone_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_service_zone_deleted_at" ON public.service_zone USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4896 (class 1259 OID 163605)
-- Name: IDX_service_zone_fulfillment_set_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_service_zone_fulfillment_set_id" ON public.service_zone USING btree (fulfillment_set_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4897 (class 1259 OID 163604)
-- Name: IDX_service_zone_name_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_service_zone_name_unique" ON public.service_zone USING btree (name) WHERE (deleted_at IS NULL);


--
-- TOC entry 4652 (class 1259 OID 162572)
-- Name: IDX_shipping_method_adjustment_promotion_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_method_adjustment_promotion_id" ON public.cart_shipping_method_adjustment USING btree (promotion_id) WHERE ((deleted_at IS NULL) AND (promotion_id IS NOT NULL));


--
-- TOC entry 4645 (class 1259 OID 162560)
-- Name: IDX_shipping_method_cart_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_method_cart_id" ON public.cart_shipping_method USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4646 (class 1259 OID 162561)
-- Name: IDX_shipping_method_option_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_method_option_id" ON public.cart_shipping_method USING btree (shipping_option_id) WHERE ((deleted_at IS NULL) AND (shipping_option_id IS NOT NULL));


--
-- TOC entry 4657 (class 1259 OID 162583)
-- Name: IDX_shipping_method_tax_line_tax_rate_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_method_tax_line_tax_rate_id" ON public.cart_shipping_method_tax_line USING btree (tax_rate_id) WHERE ((deleted_at IS NULL) AND (tax_rate_id IS NOT NULL));


--
-- TOC entry 4914 (class 1259 OID 163661)
-- Name: IDX_shipping_option_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_option_deleted_at" ON public.shipping_option USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 5047 (class 1259 OID 164091)
-- Name: IDX_shipping_option_id_ba32fa9c; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_option_id_ba32fa9c" ON public.shipping_option_price_set USING btree (shipping_option_id);


--
-- TOC entry 4915 (class 1259 OID 163790)
-- Name: IDX_shipping_option_provider_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_option_provider_id" ON public.shipping_option USING btree (provider_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4920 (class 1259 OID 163673)
-- Name: IDX_shipping_option_rule_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_option_rule_deleted_at" ON public.shipping_option_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4921 (class 1259 OID 163672)
-- Name: IDX_shipping_option_rule_shipping_option_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_option_rule_shipping_option_id" ON public.shipping_option_rule USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4916 (class 1259 OID 163657)
-- Name: IDX_shipping_option_service_zone_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_option_service_zone_id" ON public.shipping_option USING btree (service_zone_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4917 (class 1259 OID 163658)
-- Name: IDX_shipping_option_shipping_profile_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_option_shipping_profile_id" ON public.shipping_option USING btree (shipping_profile_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4907 (class 1259 OID 163632)
-- Name: IDX_shipping_option_type_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_option_type_deleted_at" ON public.shipping_option_type USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4910 (class 1259 OID 163643)
-- Name: IDX_shipping_profile_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_profile_deleted_at" ON public.shipping_profile USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 5065 (class 1259 OID 164092)
-- Name: IDX_shipping_profile_id_17a262437; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_shipping_profile_id_17a262437" ON public.product_shipping_profile USING btree (shipping_profile_id);


--
-- TOC entry 4911 (class 1259 OID 163642)
-- Name: IDX_shipping_profile_name_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_shipping_profile_name_unique" ON public.shipping_profile USING btree (name) WHERE (deleted_at IS NULL);


--
-- TOC entry 4696 (class 1259 OID 162801)
-- Name: IDX_single_default_region; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_single_default_region" ON public.tax_rate USING btree (tax_region_id) WHERE ((is_default = true) AND (deleted_at IS NULL));


--
-- TOC entry 4441 (class 1259 OID 161501)
-- Name: IDX_stock_location_address_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_stock_location_address_deleted_at" ON public.stock_location_address USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4444 (class 1259 OID 161525)
-- Name: IDX_stock_location_address_id_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_stock_location_address_id_unique" ON public.stock_location USING btree (address_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4445 (class 1259 OID 161511)
-- Name: IDX_stock_location_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_stock_location_deleted_at" ON public.stock_location USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4975 (class 1259 OID 163966)
-- Name: IDX_stock_location_id_-1e5992737; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_stock_location_id_-1e5992737" ON public.location_fulfillment_provider USING btree (stock_location_id);


--
-- TOC entry 4963 (class 1259 OID 163965)
-- Name: IDX_stock_location_id_-e88adb96; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_stock_location_id_-e88adb96" ON public.location_fulfillment_set USING btree (stock_location_id);


--
-- TOC entry 5041 (class 1259 OID 164067)
-- Name: IDX_stock_location_id_26d06f470; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_stock_location_id_26d06f470" ON public.sales_channel_stock_location USING btree (stock_location_id);


--
-- TOC entry 4682 (class 1259 OID 162759)
-- Name: IDX_store_currency_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_store_currency_deleted_at" ON public.store_currency USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4683 (class 1259 OID 162765)
-- Name: IDX_store_currency_store_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_store_currency_store_id" ON public.store_currency USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4679 (class 1259 OID 162748)
-- Name: IDX_store_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_store_deleted_at" ON public.store USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4496 (class 1259 OID 161705)
-- Name: IDX_tag_value_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_tag_value_unique" ON public.product_tag USING btree (value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4640 (class 1259 OID 162547)
-- Name: IDX_tax_line_item_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_tax_line_item_id" ON public.cart_line_item_tax_line USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4658 (class 1259 OID 162582)
-- Name: IDX_tax_line_shipping_method_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_tax_line_shipping_method_id" ON public.cart_shipping_method_tax_line USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4686 (class 1259 OID 162839)
-- Name: IDX_tax_provider_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_tax_provider_deleted_at" ON public.tax_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4697 (class 1259 OID 162800)
-- Name: IDX_tax_rate_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_tax_rate_deleted_at" ON public.tax_rate USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4701 (class 1259 OID 162813)
-- Name: IDX_tax_rate_rule_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_tax_rate_rule_deleted_at" ON public.tax_rate_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4702 (class 1259 OID 162812)
-- Name: IDX_tax_rate_rule_reference_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_tax_rate_rule_reference_id" ON public.tax_rate_rule USING btree (reference_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4703 (class 1259 OID 162811)
-- Name: IDX_tax_rate_rule_tax_rate_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_tax_rate_rule_tax_rate_id" ON public.tax_rate_rule USING btree (tax_rate_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4704 (class 1259 OID 162814)
-- Name: IDX_tax_rate_rule_unique_rate_reference; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_tax_rate_rule_unique_rate_reference" ON public.tax_rate_rule USING btree (tax_rate_id, reference_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4698 (class 1259 OID 162799)
-- Name: IDX_tax_rate_tax_region_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_tax_rate_tax_region_id" ON public.tax_rate USING btree (tax_region_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4689 (class 1259 OID 162786)
-- Name: IDX_tax_region_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_tax_region_deleted_at" ON public.tax_region USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4690 (class 1259 OID 162785)
-- Name: IDX_tax_region_parent_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_tax_region_parent_id" ON public.tax_region USING btree (parent_id);


--
-- TOC entry 4691 (class 1259 OID 162840)
-- Name: IDX_tax_region_provider_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_tax_region_provider_id" ON public.tax_region USING btree (provider_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4692 (class 1259 OID 162836)
-- Name: IDX_tax_region_unique_country_nullable_province; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_tax_region_unique_country_nullable_province" ON public.tax_region USING btree (country_code) WHERE ((province_code IS NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4693 (class 1259 OID 162835)
-- Name: IDX_tax_region_unique_country_province; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_tax_region_unique_country_province" ON public.tax_region USING btree (country_code, province_code) WHERE (deleted_at IS NULL);


--
-- TOC entry 4500 (class 1259 OID 161716)
-- Name: IDX_type_value_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_type_value_unique" ON public.product_type USING btree (value) WHERE (deleted_at IS NULL);


--
-- TOC entry 4562 (class 1259 OID 162386)
-- Name: IDX_unique_promotion_code; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_unique_promotion_code" ON public.promotion USING btree (code) WHERE (deleted_at IS NULL);


--
-- TOC entry 4881 (class 1259 OID 163562)
-- Name: IDX_user_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_user_deleted_at" ON public."user" USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- TOC entry 4882 (class 1259 OID 163565)
-- Name: IDX_user_email_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_user_email_unique" ON public."user" USING btree (email) WHERE (deleted_at IS NULL);


--
-- TOC entry 5011 (class 1259 OID 164012)
-- Name: IDX_variant_id_17b4c4e35; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_variant_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (variant_id);


--
-- TOC entry 5023 (class 1259 OID 164027)
-- Name: IDX_variant_id_52b23597; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_variant_id_52b23597" ON public.product_variant_price_set USING btree (variant_id);


--
-- TOC entry 4948 (class 1259 OID 163847)
-- Name: IDX_workflow_execution_deleted_at; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_workflow_execution_deleted_at" ON public.workflow_execution USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- TOC entry 4949 (class 1259 OID 163848)
-- Name: IDX_workflow_execution_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_workflow_execution_id" ON public.workflow_execution USING btree (id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4950 (class 1259 OID 163851)
-- Name: IDX_workflow_execution_state; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_workflow_execution_state" ON public.workflow_execution USING btree (state) WHERE (deleted_at IS NULL);


--
-- TOC entry 4951 (class 1259 OID 163850)
-- Name: IDX_workflow_execution_transaction_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_workflow_execution_transaction_id" ON public.workflow_execution USING btree (transaction_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4952 (class 1259 OID 163849)
-- Name: IDX_workflow_execution_workflow_id; Type: INDEX; Schema: public; Owner: raychou
--

CREATE INDEX "IDX_workflow_execution_workflow_id" ON public.workflow_execution USING btree (workflow_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4953 (class 1259 OID 163853)
-- Name: IDX_workflow_execution_workflow_id_transaction_id_run_id_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX "IDX_workflow_execution_workflow_id_transaction_id_run_id_unique" ON public.workflow_execution USING btree (workflow_id, transaction_id, run_id) WHERE (deleted_at IS NULL);


--
-- TOC entry 5068 (class 1259 OID 164112)
-- Name: idx_script_name_unique; Type: INDEX; Schema: public; Owner: raychou
--

CREATE UNIQUE INDEX idx_script_name_unique ON public.script_migrations USING btree (script_name);


--
-- TOC entry 5136 (class 2606 OID 162830)
-- Name: tax_rate_rule FK_tax_rate_rule_tax_rate_id; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.tax_rate_rule
    ADD CONSTRAINT "FK_tax_rate_rule_tax_rate_id" FOREIGN KEY (tax_rate_id) REFERENCES public.tax_rate(id) ON DELETE CASCADE;


--
-- TOC entry 5135 (class 2606 OID 162825)
-- Name: tax_rate FK_tax_rate_tax_region_id; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.tax_rate
    ADD CONSTRAINT "FK_tax_rate_tax_region_id" FOREIGN KEY (tax_region_id) REFERENCES public.tax_region(id) ON DELETE CASCADE;


--
-- TOC entry 5134 (class 2606 OID 162820)
-- Name: tax_region FK_tax_region_parent_id; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.tax_region
    ADD CONSTRAINT "FK_tax_region_parent_id" FOREIGN KEY (parent_id) REFERENCES public.tax_region(id) ON DELETE CASCADE;


--
-- TOC entry 5133 (class 2606 OID 162815)
-- Name: tax_region FK_tax_region_provider_id; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.tax_region
    ADD CONSTRAINT "FK_tax_region_provider_id" FOREIGN KEY (provider_id) REFERENCES public.tax_provider(id) ON DELETE SET NULL;


--
-- TOC entry 5116 (class 2606 OID 162310)
-- Name: application_method_buy_rules application_method_buy_rules_application_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.application_method_buy_rules
    ADD CONSTRAINT application_method_buy_rules_application_method_id_foreign FOREIGN KEY (application_method_id) REFERENCES public.promotion_application_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5117 (class 2606 OID 162315)
-- Name: application_method_buy_rules application_method_buy_rules_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.application_method_buy_rules
    ADD CONSTRAINT application_method_buy_rules_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5114 (class 2606 OID 162300)
-- Name: application_method_target_rules application_method_target_rules_application_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.application_method_target_rules
    ADD CONSTRAINT application_method_target_rules_application_method_id_foreign FOREIGN KEY (application_method_id) REFERENCES public.promotion_application_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5115 (class 2606 OID 162305)
-- Name: application_method_target_rules application_method_target_rules_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.application_method_target_rules
    ADD CONSTRAINT application_method_target_rules_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5142 (class 2606 OID 162956)
-- Name: capture capture_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.capture
    ADD CONSTRAINT capture_payment_id_foreign FOREIGN KEY (payment_id) REFERENCES public.payment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5122 (class 2606 OID 162518)
-- Name: cart cart_billing_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_billing_address_id_foreign FOREIGN KEY (billing_address_id) REFERENCES public.cart_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5125 (class 2606 OID 162635)
-- Name: cart_line_item_adjustment cart_line_item_adjustment_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_line_item_adjustment
    ADD CONSTRAINT cart_line_item_adjustment_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.cart_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5124 (class 2606 OID 162629)
-- Name: cart_line_item cart_line_item_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_line_item
    ADD CONSTRAINT cart_line_item_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5126 (class 2606 OID 162641)
-- Name: cart_line_item_tax_line cart_line_item_tax_line_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_line_item_tax_line
    ADD CONSTRAINT cart_line_item_tax_line_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.cart_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5123 (class 2606 OID 162513)
-- Name: cart cart_shipping_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_shipping_address_id_foreign FOREIGN KEY (shipping_address_id) REFERENCES public.cart_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5128 (class 2606 OID 162604)
-- Name: cart_shipping_method_adjustment cart_shipping_method_adjustment_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_shipping_method_adjustment
    ADD CONSTRAINT cart_shipping_method_adjustment_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.cart_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5127 (class 2606 OID 162647)
-- Name: cart_shipping_method cart_shipping_method_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_shipping_method
    ADD CONSTRAINT cart_shipping_method_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5129 (class 2606 OID 162609)
-- Name: cart_shipping_method_tax_line cart_shipping_method_tax_line_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.cart_shipping_method_tax_line
    ADD CONSTRAINT cart_shipping_method_tax_line_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.cart_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5130 (class 2606 OID 162688)
-- Name: credit_line credit_line_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.credit_line
    ADD CONSTRAINT credit_line_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON UPDATE CASCADE;


--
-- TOC entry 5119 (class 2606 OID 162433)
-- Name: customer_address customer_address_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.customer_address
    ADD CONSTRAINT customer_address_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5120 (class 2606 OID 162453)
-- Name: customer_group_customer customer_group_customer_customer_group_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.customer_group_customer
    ADD CONSTRAINT customer_group_customer_customer_group_id_foreign FOREIGN KEY (customer_group_id) REFERENCES public.customer_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5121 (class 2606 OID 162458)
-- Name: customer_group_customer customer_group_customer_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.customer_group_customer
    ADD CONSTRAINT customer_group_customer_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5169 (class 2606 OID 163796)
-- Name: fulfillment fulfillment_delivery_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_delivery_address_id_foreign FOREIGN KEY (delivery_address_id) REFERENCES public.fulfillment_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5171 (class 2606 OID 163768)
-- Name: fulfillment_item fulfillment_item_fulfillment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.fulfillment_item
    ADD CONSTRAINT fulfillment_item_fulfillment_id_foreign FOREIGN KEY (fulfillment_id) REFERENCES public.fulfillment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5170 (class 2606 OID 163763)
-- Name: fulfillment_label fulfillment_label_fulfillment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.fulfillment_label
    ADD CONSTRAINT fulfillment_label_fulfillment_id_foreign FOREIGN KEY (fulfillment_id) REFERENCES public.fulfillment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5168 (class 2606 OID 163791)
-- Name: fulfillment fulfillment_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.fulfillment_provider(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5167 (class 2606 OID 163753)
-- Name: fulfillment fulfillment_shipping_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_shipping_option_id_foreign FOREIGN KEY (shipping_option_id) REFERENCES public.shipping_option(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5161 (class 2606 OID 163718)
-- Name: geo_zone geo_zone_service_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.geo_zone
    ADD CONSTRAINT geo_zone_service_zone_id_foreign FOREIGN KEY (service_zone_id) REFERENCES public.service_zone(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5097 (class 2606 OID 161866)
-- Name: image image_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5090 (class 2606 OID 161567)
-- Name: inventory_level inventory_level_inventory_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.inventory_level
    ADD CONSTRAINT inventory_level_inventory_item_id_foreign FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5172 (class 2606 OID 163820)
-- Name: notification notification_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.notification_provider(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5143 (class 2606 OID 163238)
-- Name: order order_billing_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_billing_address_id_foreign FOREIGN KEY (billing_address_id) REFERENCES public.order_address(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5147 (class 2606 OID 163248)
-- Name: order_change_action order_change_action_order_change_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_change_action
    ADD CONSTRAINT order_change_action_order_change_id_foreign FOREIGN KEY (order_change_id) REFERENCES public.order_change(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5146 (class 2606 OID 163243)
-- Name: order_change order_change_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_change
    ADD CONSTRAINT order_change_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5158 (class 2606 OID 163505)
-- Name: order_credit_line order_credit_line_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_credit_line
    ADD CONSTRAINT order_credit_line_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5148 (class 2606 OID 163258)
-- Name: order_item order_item_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5149 (class 2606 OID 163253)
-- Name: order_item order_item_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5153 (class 2606 OID 163273)
-- Name: order_line_item_adjustment order_line_item_adjustment_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_line_item_adjustment
    ADD CONSTRAINT order_line_item_adjustment_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5152 (class 2606 OID 163268)
-- Name: order_line_item_tax_line order_line_item_tax_line_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_line_item_tax_line
    ADD CONSTRAINT order_line_item_tax_line_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5151 (class 2606 OID 163263)
-- Name: order_line_item order_line_item_totals_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_line_item
    ADD CONSTRAINT order_line_item_totals_id_foreign FOREIGN KEY (totals_id) REFERENCES public.order_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5144 (class 2606 OID 163233)
-- Name: order order_shipping_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_shipping_address_id_foreign FOREIGN KEY (shipping_address_id) REFERENCES public.order_address(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5154 (class 2606 OID 163283)
-- Name: order_shipping_method_adjustment order_shipping_method_adjustment_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_shipping_method_adjustment
    ADD CONSTRAINT order_shipping_method_adjustment_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.order_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5155 (class 2606 OID 163288)
-- Name: order_shipping_method_tax_line order_shipping_method_tax_line_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_shipping_method_tax_line
    ADD CONSTRAINT order_shipping_method_tax_line_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.order_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5150 (class 2606 OID 163278)
-- Name: order_shipping order_shipping_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5145 (class 2606 OID 163499)
-- Name: order_summary order_summary_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_summary
    ADD CONSTRAINT order_summary_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5156 (class 2606 OID 163293)
-- Name: order_transaction order_transaction_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.order_transaction
    ADD CONSTRAINT order_transaction_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5137 (class 2606 OID 163012)
-- Name: payment_collection_payment_providers payment_collection_payment_providers_payment_col_aa276_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.payment_collection_payment_providers
    ADD CONSTRAINT payment_collection_payment_providers_payment_col_aa276_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5138 (class 2606 OID 163017)
-- Name: payment_collection_payment_providers payment_collection_payment_providers_payment_pro_2d555_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.payment_collection_payment_providers
    ADD CONSTRAINT payment_collection_payment_providers_payment_pro_2d555_foreign FOREIGN KEY (payment_provider_id) REFERENCES public.payment_provider(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5140 (class 2606 OID 162992)
-- Name: payment payment_payment_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_payment_collection_id_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5139 (class 2606 OID 162987)
-- Name: payment_session payment_session_payment_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.payment_session
    ADD CONSTRAINT payment_session_payment_collection_id_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5108 (class 2606 OID 162111)
-- Name: price_list_rule price_list_rule_price_list_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.price_list_rule
    ADD CONSTRAINT price_list_rule_price_list_id_foreign FOREIGN KEY (price_list_id) REFERENCES public.price_list(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5105 (class 2606 OID 162096)
-- Name: price price_price_list_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_price_list_id_foreign FOREIGN KEY (price_list_id) REFERENCES public.price_list(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5106 (class 2606 OID 161992)
-- Name: price price_price_set_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_price_set_id_foreign FOREIGN KEY (price_set_id) REFERENCES public.price_set(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5107 (class 2606 OID 162122)
-- Name: price_rule price_rule_price_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.price_rule
    ADD CONSTRAINT price_rule_price_id_foreign FOREIGN KEY (price_id) REFERENCES public.price(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5098 (class 2606 OID 161838)
-- Name: product_category product_category_parent_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_category
    ADD CONSTRAINT product_category_parent_category_id_foreign FOREIGN KEY (parent_category_id) REFERENCES public.product_category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5101 (class 2606 OID 161833)
-- Name: product_category_product product_category_product_product_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_category_product
    ADD CONSTRAINT product_category_product_product_category_id_foreign FOREIGN KEY (product_category_id) REFERENCES public.product_category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5102 (class 2606 OID 161828)
-- Name: product_category_product product_category_product_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_category_product
    ADD CONSTRAINT product_category_product_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5092 (class 2606 OID 161773)
-- Name: product product_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_collection_id_foreign FOREIGN KEY (collection_id) REFERENCES public.product_collection(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5095 (class 2606 OID 161876)
-- Name: product_option product_option_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_option
    ADD CONSTRAINT product_option_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5096 (class 2606 OID 161793)
-- Name: product_option_value product_option_value_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_option_value
    ADD CONSTRAINT product_option_value_option_id_foreign FOREIGN KEY (option_id) REFERENCES public.product_option(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5099 (class 2606 OID 161818)
-- Name: product_tags product_tags_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5100 (class 2606 OID 161823)
-- Name: product_tags product_tags_product_tag_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_product_tag_id_foreign FOREIGN KEY (product_tag_id) REFERENCES public.product_tag(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5093 (class 2606 OID 161778)
-- Name: product product_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_type_id_foreign FOREIGN KEY (type_id) REFERENCES public.product_type(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5103 (class 2606 OID 161803)
-- Name: product_variant_option product_variant_option_option_value_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT product_variant_option_option_value_id_foreign FOREIGN KEY (option_value_id) REFERENCES public.product_option_value(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5104 (class 2606 OID 161798)
-- Name: product_variant_option product_variant_option_variant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT product_variant_option_variant_id_foreign FOREIGN KEY (variant_id) REFERENCES public.product_variant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5094 (class 2606 OID 161783)
-- Name: product_variant product_variant_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.product_variant
    ADD CONSTRAINT product_variant_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5111 (class 2606 OID 162285)
-- Name: promotion_application_method promotion_application_method_promotion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.promotion_application_method
    ADD CONSTRAINT promotion_application_method_promotion_id_foreign FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5109 (class 2606 OID 162334)
-- Name: promotion_campaign_budget promotion_campaign_budget_campaign_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.promotion_campaign_budget
    ADD CONSTRAINT promotion_campaign_budget_campaign_id_foreign FOREIGN KEY (campaign_id) REFERENCES public.promotion_campaign(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5110 (class 2606 OID 162325)
-- Name: promotion promotion_campaign_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.promotion
    ADD CONSTRAINT promotion_campaign_id_foreign FOREIGN KEY (campaign_id) REFERENCES public.promotion_campaign(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5112 (class 2606 OID 162290)
-- Name: promotion_promotion_rule promotion_promotion_rule_promotion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.promotion_promotion_rule
    ADD CONSTRAINT promotion_promotion_rule_promotion_id_foreign FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5113 (class 2606 OID 162295)
-- Name: promotion_promotion_rule promotion_promotion_rule_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.promotion_promotion_rule
    ADD CONSTRAINT promotion_promotion_rule_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5118 (class 2606 OID 162320)
-- Name: promotion_rule_value promotion_rule_value_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.promotion_rule_value
    ADD CONSTRAINT promotion_rule_value_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5159 (class 2606 OID 163530)
-- Name: provider_identity provider_identity_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.provider_identity
    ADD CONSTRAINT provider_identity_auth_identity_id_foreign FOREIGN KEY (auth_identity_id) REFERENCES public.auth_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5141 (class 2606 OID 162961)
-- Name: refund refund_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.refund
    ADD CONSTRAINT refund_payment_id_foreign FOREIGN KEY (payment_id) REFERENCES public.payment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5131 (class 2606 OID 162714)
-- Name: region_country region_country_region_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.region_country
    ADD CONSTRAINT region_country_region_id_foreign FOREIGN KEY (region_id) REFERENCES public.region(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5091 (class 2606 OID 161572)
-- Name: reservation_item reservation_item_inventory_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.reservation_item
    ADD CONSTRAINT reservation_item_inventory_item_id_foreign FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5157 (class 2606 OID 163227)
-- Name: return_reason return_reason_parent_return_reason_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.return_reason
    ADD CONSTRAINT return_reason_parent_return_reason_id_foreign FOREIGN KEY (parent_return_reason_id) REFERENCES public.return_reason(id);


--
-- TOC entry 5160 (class 2606 OID 163713)
-- Name: service_zone service_zone_fulfillment_set_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.service_zone
    ADD CONSTRAINT service_zone_fulfillment_set_id_foreign FOREIGN KEY (fulfillment_set_id) REFERENCES public.fulfillment_set(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5164 (class 2606 OID 163780)
-- Name: shipping_option shipping_option_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.fulfillment_provider(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5166 (class 2606 OID 163743)
-- Name: shipping_option_rule shipping_option_rule_shipping_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.shipping_option_rule
    ADD CONSTRAINT shipping_option_rule_shipping_option_id_foreign FOREIGN KEY (shipping_option_id) REFERENCES public.shipping_option(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5162 (class 2606 OID 163723)
-- Name: shipping_option shipping_option_service_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_service_zone_id_foreign FOREIGN KEY (service_zone_id) REFERENCES public.service_zone(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5165 (class 2606 OID 163785)
-- Name: shipping_option shipping_option_shipping_option_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_shipping_option_type_id_foreign FOREIGN KEY (shipping_option_type_id) REFERENCES public.shipping_option_type(id) ON UPDATE CASCADE;


--
-- TOC entry 5163 (class 2606 OID 163728)
-- Name: shipping_option shipping_option_shipping_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_shipping_profile_id_foreign FOREIGN KEY (shipping_profile_id) REFERENCES public.shipping_profile(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5089 (class 2606 OID 161517)
-- Name: stock_location stock_location_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.stock_location
    ADD CONSTRAINT stock_location_address_id_foreign FOREIGN KEY (address_id) REFERENCES public.stock_location_address(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5132 (class 2606 OID 162760)
-- Name: store_currency store_currency_store_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: raychou
--

ALTER TABLE ONLY public.store_currency
    ADD CONSTRAINT store_currency_store_id_foreign FOREIGN KEY (store_id) REFERENCES public.store(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-08-13 21:31:33 CST

--
-- PostgreSQL database dump complete
--

