PGDMP                     	    {           mycare    15.2    15.2 |    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    41304    mycare    DATABASE     h   CREATE DATABASE mycare WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';
    DROP DATABASE mycare;
                postgres    false            �            1255    82540    count_patterns_by_date()    FUNCTION     �  CREATE FUNCTION public.count_patterns_by_date() RETURNS TABLE(shift_date date, total_shift_home_records integer, pattern text, pattern_count integer)
    LANGUAGE plpgsql
    AS $_$
DECLARE
  pattern_name TEXT;
BEGIN
  FOR pattern_name IN (SELECT DISTINCT pattern FROM shift_home) LOOP
    RETURN QUERY
    EXECUTE '
      SELECT
        s.date AS shift_date,
        COUNT(*) AS total_shift_home_records,
        '''' || $1 || '''' AS pattern,
        COUNT(*) FILTER (WHERE sh.pattern = ' || quote_literal(pattern_name) || ') AS pattern_count
      FROM
        shift s
      JOIN
        shift_home sh ON sh.shift_id = s.id
      GROUP BY
        s.date
      ORDER BY
        s.date
    '
    USING pattern_name;
  END LOOP;
END;
$_$;
 /   DROP FUNCTION public.count_patterns_by_date();
       public          postgres    false            �            1259    82265    agency    TABLE     �   CREATE TABLE public.agency (
    id integer NOT NULL,
    company character varying(255),
    postcode character varying(255),
    address character varying(255),
    city character varying(255),
    phone character varying(14),
    user_id integer
);
    DROP TABLE public.agency;
       public         heap    postgres    false            �            1259    82264    agency_id_seq    SEQUENCE     �   CREATE SEQUENCE public.agency_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.agency_id_seq;
       public          postgres    false    217            �           0    0    agency_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.agency_id_seq OWNED BY public.agency.id;
          public          postgres    false    216            �            1259    82506    agency_shift_pattern    TABLE     �   CREATE TABLE public.agency_shift_pattern (
    id integer NOT NULL,
    agency_id integer,
    pattern character varying(255)
);
 (   DROP TABLE public.agency_shift_pattern;
       public         heap    postgres    false            �            1259    82505    agency_shift_pattern_id_seq    SEQUENCE     �   CREATE SEQUENCE public.agency_shift_pattern_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.agency_shift_pattern_id_seq;
       public          postgres    false    232            �           0    0    agency_shift_pattern_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.agency_shift_pattern_id_seq OWNED BY public.agency_shift_pattern.id;
          public          postgres    false    231            �            1259    82281    carers    TABLE     z  CREATE TABLE public.carers (
    id integer NOT NULL,
    firstname character varying(255),
    lastname character varying(255),
    address character varying(255),
    city character varying(255),
    phone character varying(255),
    user_id integer,
    postcode character varying(10),
    agency_id integer,
    dob character varying(10),
    role character varying(255)
);
    DROP TABLE public.carers;
       public         heap    postgres    false            �            1259    82280    carers_id_seq    SEQUENCE     �   CREATE SEQUENCE public.carers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.carers_id_seq;
       public          postgres    false    219            �           0    0    carers_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.carers_id_seq OWNED BY public.carers.id;
          public          postgres    false    218            �            1259    82295    home    TABLE       CREATE TABLE public.home (
    id integer NOT NULL,
    company character varying(255),
    address character varying(255),
    city character varying(255),
    postcode character varying(10),
    phone character varying(255),
    user_id integer,
    active_agency integer
);
    DROP TABLE public.home;
       public         heap    postgres    false            �            1259    82323    home_agency    TABLE     b   CREATE TABLE public.home_agency (
    home_id integer NOT NULL,
    agency_id integer NOT NULL
);
    DROP TABLE public.home_agency;
       public         heap    postgres    false            �            1259    82677 
   home_carer    TABLE     R  CREATE TABLE public.home_carer (
    id integer,
    firstname character varying(255),
    lastname character varying(255),
    address character varying(255),
    city character varying(255),
    phone character varying(255),
    user_id integer,
    postcode character varying(10),
    dob character varying(10),
    home_id integer
);
    DROP TABLE public.home_carer;
       public         heap    postgres    false            �            1259    98600    home_guest_user    TABLE     �   CREATE TABLE public.home_guest_user (
    id integer NOT NULL,
    username character varying(255),
    password character varying(255),
    home_id integer,
    role integer
);
 #   DROP TABLE public.home_guest_user;
       public         heap    postgres    false            �            1259    98599    home_guest_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.home_guest_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.home_guest_user_id_seq;
       public          postgres    false    241            �           0    0    home_guest_user_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.home_guest_user_id_seq OWNED BY public.home_guest_user.id;
          public          postgres    false    240            �            1259    82294    home_id_seq    SEQUENCE     �   CREATE SEQUENCE public.home_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.home_id_seq;
       public          postgres    false    221            �           0    0    home_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.home_id_seq OWNED BY public.home.id;
          public          postgres    false    220            �            1259    82659 
   home_nurse    TABLE     q  CREATE TABLE public.home_nurse (
    id integer NOT NULL,
    firstname character varying(255),
    lastname character varying(255),
    dob character varying(10),
    address character varying(255),
    city character varying(255),
    postcode character varying(255),
    country character varying(255),
    phone character varying(255),
    home_staff_id integer
);
    DROP TABLE public.home_nurse;
       public         heap    postgres    false            �            1259    82658    home_nurse_id_seq    SEQUENCE     �   CREATE SEQUENCE public.home_nurse_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.home_nurse_id_seq;
       public          postgres    false    236            �           0    0    home_nurse_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.home_nurse_id_seq OWNED BY public.home_nurse.id;
          public          postgres    false    235            �            1259    98584 
   home_staff    TABLE     |  CREATE TABLE public.home_staff (
    firstname character varying(255),
    lastname character varying(255),
    address character varying(255),
    city character varying(255),
    phone character varying(255),
    user_id integer,
    postcode character varying(10),
    dob character varying(10),
    home_id integer,
    role character varying(255),
    id integer NOT NULL
);
    DROP TABLE public.home_staff;
       public         heap    postgres    false            �            1259    98589    home_staff_id_seq    SEQUENCE     �   CREATE SEQUENCE public.home_staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.home_staff_id_seq;
       public          postgres    false    238            �           0    0    home_staff_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.home_staff_id_seq OWNED BY public.home_staff.id;
          public          postgres    false    239            �            1259    82489    shift    TABLE     �   CREATE TABLE public.shift (
    id integer NOT NULL,
    date date,
    home_id integer,
    agency_id integer,
    custom boolean
);
    DROP TABLE public.shift;
       public         heap    postgres    false            �            1259    82518 
   shift_home    TABLE     �   CREATE TABLE public.shift_home (
    id integer NOT NULL,
    pattern character varying(255),
    shift_id integer,
    home_id integer,
    agency_id integer,
    count integer,
    assigned jsonb[],
    completed jsonb[]
);
    DROP TABLE public.shift_home;
       public         heap    postgres    false            �            1259    82517    shift_home_id_seq    SEQUENCE     �   CREATE SEQUENCE public.shift_home_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.shift_home_id_seq;
       public          postgres    false    234            �           0    0    shift_home_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.shift_home_id_seq OWNED BY public.shift_home.id;
          public          postgres    false    233            �            1259    82488    shift_id_seq    SEQUENCE     �   CREATE SEQUENCE public.shift_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.shift_id_seq;
       public          postgres    false    230            �           0    0    shift_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.shift_id_seq OWNED BY public.shift.id;
          public          postgres    false    229            �            1259    82481    shift_patterns    TABLE     �   CREATE TABLE public.shift_patterns (
    id integer NOT NULL,
    pattern character varying(255),
    start_time character varying(10),
    end_time character varying(10),
    hours character varying(10)
);
 "   DROP TABLE public.shift_patterns;
       public         heap    postgres    false            �            1259    82480    shift_patterns_id_seq    SEQUENCE     �   CREATE SEQUENCE public.shift_patterns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.shift_patterns_id_seq;
       public          postgres    false    228            �           0    0    shift_patterns_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.shift_patterns_id_seq OWNED BY public.shift_patterns.id;
          public          postgres    false    227            �            1259    82344    shifts    TABLE     �  CREATE TABLE public.shifts (
    id integer NOT NULL,
    date date,
    agency_id integer,
    home_id integer,
    completed boolean,
    longday integer,
    night integer,
    early integer,
    late integer,
    early_ass jsonb[] DEFAULT '{}'::jsonb[],
    late_ass jsonb[] DEFAULT '{}'::jsonb[],
    longday_ass jsonb[] DEFAULT '{}'::jsonb[],
    night_ass jsonb[] DEFAULT '{}'::jsonb[],
    short boolean DEFAULT false
);
    DROP TABLE public.shifts;
       public         heap    postgres    false            �            1259    82343    shifts_id_seq    SEQUENCE     �   CREATE SEQUENCE public.shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.shifts_id_seq;
       public          postgres    false    224            �           0    0    shifts_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;
          public          postgres    false    223            �            1259    82446 	   timesheet    TABLE     �   CREATE TABLE public.timesheet (
    id integer NOT NULL,
    carer_id integer,
    home_id integer,
    date date,
    shift_home_id integer,
    signature bytea,
    agency_id integer,
    pattern character varying(255)
);
    DROP TABLE public.timesheet;
       public         heap    postgres    false            �            1259    82445    timesheet_id_seq    SEQUENCE     �   CREATE SEQUENCE public.timesheet_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.timesheet_id_seq;
       public          postgres    false    226            �           0    0    timesheet_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.timesheet_id_seq OWNED BY public.timesheet.id;
          public          postgres    false    225            �            1259    82201    users    TABLE     ~   CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255),
    password text,
    role integer
);
    DROP TABLE public.users;
       public         heap    postgres    false            �            1259    82200    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    215            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    214            �           2604    82268 	   agency id    DEFAULT     f   ALTER TABLE ONLY public.agency ALTER COLUMN id SET DEFAULT nextval('public.agency_id_seq'::regclass);
 8   ALTER TABLE public.agency ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    217    217            �           2604    82509    agency_shift_pattern id    DEFAULT     �   ALTER TABLE ONLY public.agency_shift_pattern ALTER COLUMN id SET DEFAULT nextval('public.agency_shift_pattern_id_seq'::regclass);
 F   ALTER TABLE public.agency_shift_pattern ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    231    232    232            �           2604    82284 	   carers id    DEFAULT     f   ALTER TABLE ONLY public.carers ALTER COLUMN id SET DEFAULT nextval('public.carers_id_seq'::regclass);
 8   ALTER TABLE public.carers ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    218    219    219            �           2604    82298    home id    DEFAULT     b   ALTER TABLE ONLY public.home ALTER COLUMN id SET DEFAULT nextval('public.home_id_seq'::regclass);
 6   ALTER TABLE public.home ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    220    221    221            �           2604    98603    home_guest_user id    DEFAULT     x   ALTER TABLE ONLY public.home_guest_user ALTER COLUMN id SET DEFAULT nextval('public.home_guest_user_id_seq'::regclass);
 A   ALTER TABLE public.home_guest_user ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    240    241    241            �           2604    82662    home_nurse id    DEFAULT     n   ALTER TABLE ONLY public.home_nurse ALTER COLUMN id SET DEFAULT nextval('public.home_nurse_id_seq'::regclass);
 <   ALTER TABLE public.home_nurse ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    235    236    236            �           2604    98590    home_staff id    DEFAULT     n   ALTER TABLE ONLY public.home_staff ALTER COLUMN id SET DEFAULT nextval('public.home_staff_id_seq'::regclass);
 <   ALTER TABLE public.home_staff ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    239    238            �           2604    82492    shift id    DEFAULT     d   ALTER TABLE ONLY public.shift ALTER COLUMN id SET DEFAULT nextval('public.shift_id_seq'::regclass);
 7   ALTER TABLE public.shift ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    230    229    230            �           2604    82521    shift_home id    DEFAULT     n   ALTER TABLE ONLY public.shift_home ALTER COLUMN id SET DEFAULT nextval('public.shift_home_id_seq'::regclass);
 <   ALTER TABLE public.shift_home ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    233    234    234            �           2604    82484    shift_patterns id    DEFAULT     v   ALTER TABLE ONLY public.shift_patterns ALTER COLUMN id SET DEFAULT nextval('public.shift_patterns_id_seq'::regclass);
 @   ALTER TABLE public.shift_patterns ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    228    227    228            �           2604    82347 	   shifts id    DEFAULT     f   ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);
 8   ALTER TABLE public.shifts ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    224    223    224            �           2604    82449    timesheet id    DEFAULT     l   ALTER TABLE ONLY public.timesheet ALTER COLUMN id SET DEFAULT nextval('public.timesheet_id_seq'::regclass);
 ;   ALTER TABLE public.timesheet ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    225    226    226            �           2604    82204    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    214    215    215            �          0    82265    agency 
   TABLE DATA           V   COPY public.agency (id, company, postcode, address, city, phone, user_id) FROM stdin;
    public          postgres    false    217   ՗       �          0    82506    agency_shift_pattern 
   TABLE DATA           F   COPY public.agency_shift_pattern (id, agency_id, pattern) FROM stdin;
    public          postgres    false    232   >�       �          0    82281    carers 
   TABLE DATA           x   COPY public.carers (id, firstname, lastname, address, city, phone, user_id, postcode, agency_id, dob, role) FROM stdin;
    public          postgres    false    219   w�       �          0    82295    home 
   TABLE DATA           c   COPY public.home (id, company, address, city, postcode, phone, user_id, active_agency) FROM stdin;
    public          postgres    false    221   ��       �          0    82323    home_agency 
   TABLE DATA           9   COPY public.home_agency (home_id, agency_id) FROM stdin;
    public          postgres    false    222   [�       �          0    82677 
   home_carer 
   TABLE DATA           t   COPY public.home_carer (id, firstname, lastname, address, city, phone, user_id, postcode, dob, home_id) FROM stdin;
    public          postgres    false    237   }�       �          0    98600    home_guest_user 
   TABLE DATA           P   COPY public.home_guest_user (id, username, password, home_id, role) FROM stdin;
    public          postgres    false    241   ��       �          0    82659 
   home_nurse 
   TABLE DATA           z   COPY public.home_nurse (id, firstname, lastname, dob, address, city, postcode, country, phone, home_staff_id) FROM stdin;
    public          postgres    false    236   	�       �          0    98584 
   home_staff 
   TABLE DATA           z   COPY public.home_staff (firstname, lastname, address, city, phone, user_id, postcode, dob, home_id, role, id) FROM stdin;
    public          postgres    false    238   &�       �          0    82489    shift 
   TABLE DATA           E   COPY public.shift (id, date, home_id, agency_id, custom) FROM stdin;
    public          postgres    false    230   C�       �          0    82518 
   shift_home 
   TABLE DATA           k   COPY public.shift_home (id, pattern, shift_id, home_id, agency_id, count, assigned, completed) FROM stdin;
    public          postgres    false    234   ��       �          0    82481    shift_patterns 
   TABLE DATA           R   COPY public.shift_patterns (id, pattern, start_time, end_time, hours) FROM stdin;
    public          postgres    false    228   ��       �          0    82344    shifts 
   TABLE DATA           �   COPY public.shifts (id, date, agency_id, home_id, completed, longday, night, early, late, early_ass, late_ass, longday_ass, night_ass, short) FROM stdin;
    public          postgres    false    224   �       �          0    82446 	   timesheet 
   TABLE DATA           n   COPY public.timesheet (id, carer_id, home_id, date, shift_home_id, signature, agency_id, pattern) FROM stdin;
    public          postgres    false    226   7�       �          0    82201    users 
   TABLE DATA           :   COPY public.users (id, email, password, role) FROM stdin;
    public          postgres    false    215   T�       �           0    0    agency_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.agency_id_seq', 8, true);
          public          postgres    false    216            �           0    0    agency_shift_pattern_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.agency_shift_pattern_id_seq', 13, true);
          public          postgres    false    231            �           0    0    carers_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.carers_id_seq', 10, true);
          public          postgres    false    218            �           0    0    home_guest_user_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.home_guest_user_id_seq', 1, true);
          public          postgres    false    240            �           0    0    home_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.home_id_seq', 10, true);
          public          postgres    false    220            �           0    0    home_nurse_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.home_nurse_id_seq', 1, false);
          public          postgres    false    235            �           0    0    home_staff_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.home_staff_id_seq', 3, true);
          public          postgres    false    239            �           0    0    shift_home_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.shift_home_id_seq', 104, true);
          public          postgres    false    233            �           0    0    shift_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.shift_id_seq', 25, true);
          public          postgres    false    229            �           0    0    shift_patterns_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.shift_patterns_id_seq', 7, true);
          public          postgres    false    227            �           0    0    shifts_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.shifts_id_seq', 35, true);
          public          postgres    false    223            �           0    0    timesheet_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.timesheet_id_seq', 14, true);
          public          postgres    false    225            �           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 50, true);
          public          postgres    false    214            �           2606    82272    agency agency_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.agency
    ADD CONSTRAINT agency_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.agency DROP CONSTRAINT agency_pkey;
       public            postgres    false    217            �           2606    82511 .   agency_shift_pattern agency_shift_pattern_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.agency_shift_pattern
    ADD CONSTRAINT agency_shift_pattern_pkey PRIMARY KEY (id);
 X   ALTER TABLE ONLY public.agency_shift_pattern DROP CONSTRAINT agency_shift_pattern_pkey;
       public            postgres    false    232            �           2606    82274    agency agency_user_id_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.agency
    ADD CONSTRAINT agency_user_id_key UNIQUE (user_id);
 C   ALTER TABLE ONLY public.agency DROP CONSTRAINT agency_user_id_key;
       public            postgres    false    217            �           2606    82288    carers carers_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.carers
    ADD CONSTRAINT carers_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.carers DROP CONSTRAINT carers_pkey;
       public            postgres    false    219            �           2606    82327    home_agency home_agency_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.home_agency
    ADD CONSTRAINT home_agency_pkey PRIMARY KEY (home_id, agency_id);
 F   ALTER TABLE ONLY public.home_agency DROP CONSTRAINT home_agency_pkey;
       public            postgres    false    222    222            �           2606    98607 $   home_guest_user home_guest_user_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.home_guest_user
    ADD CONSTRAINT home_guest_user_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.home_guest_user DROP CONSTRAINT home_guest_user_pkey;
       public            postgres    false    241            �           2606    98609 ,   home_guest_user home_guest_user_username_key 
   CONSTRAINT     k   ALTER TABLE ONLY public.home_guest_user
    ADD CONSTRAINT home_guest_user_username_key UNIQUE (username);
 V   ALTER TABLE ONLY public.home_guest_user DROP CONSTRAINT home_guest_user_username_key;
       public            postgres    false    241            �           2606    82666    home_nurse home_nurse_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.home_nurse
    ADD CONSTRAINT home_nurse_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.home_nurse DROP CONSTRAINT home_nurse_pkey;
       public            postgres    false    236            �           2606    82302    home home_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.home
    ADD CONSTRAINT home_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.home DROP CONSTRAINT home_pkey;
       public            postgres    false    221            �           2606    98592    home_staff home_staff_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.home_staff
    ADD CONSTRAINT home_staff_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.home_staff DROP CONSTRAINT home_staff_pkey;
       public            postgres    false    238            �           2606    82523    shift_home shift_home_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.shift_home
    ADD CONSTRAINT shift_home_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.shift_home DROP CONSTRAINT shift_home_pkey;
       public            postgres    false    234            �           2606    82542 $   shift_home shift_home_unique_pattern 
   CONSTRAINT     �   ALTER TABLE ONLY public.shift_home
    ADD CONSTRAINT shift_home_unique_pattern UNIQUE (pattern, home_id, agency_id, shift_id);
 N   ALTER TABLE ONLY public.shift_home DROP CONSTRAINT shift_home_unique_pattern;
       public            postgres    false    234    234    234    234            �           2606    82486 "   shift_patterns shift_patterns_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.shift_patterns
    ADD CONSTRAINT shift_patterns_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.shift_patterns DROP CONSTRAINT shift_patterns_pkey;
       public            postgres    false    228            �           2606    82494    shift shift_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.shift
    ADD CONSTRAINT shift_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.shift DROP CONSTRAINT shift_pkey;
       public            postgres    false    230            �           2606    82349    shifts shifts_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.shifts DROP CONSTRAINT shifts_pkey;
       public            postgres    false    224            �           2606    82453    timesheet timesheet_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.timesheet
    ADD CONSTRAINT timesheet_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.timesheet DROP CONSTRAINT timesheet_pkey;
       public            postgres    false    226            �           2606    82370    shifts unique_date 
   CONSTRAINT     M   ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT unique_date UNIQUE (date);
 <   ALTER TABLE ONLY public.shifts DROP CONSTRAINT unique_date;
       public            postgres    false    224            �           2606    82208    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    215            �           2606    82512 8   agency_shift_pattern agency_shift_pattern_agency_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.agency_shift_pattern
    ADD CONSTRAINT agency_shift_pattern_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES public.agency(id) ON DELETE CASCADE;
 b   ALTER TABLE ONLY public.agency_shift_pattern DROP CONSTRAINT agency_shift_pattern_agency_id_fkey;
       public          postgres    false    217    3529    232            �           2606    82338    carers fk_agency    FK CONSTRAINT     r   ALTER TABLE ONLY public.carers
    ADD CONSTRAINT fk_agency FOREIGN KEY (agency_id) REFERENCES public.agency(id);
 :   ALTER TABLE ONLY public.carers DROP CONSTRAINT fk_agency;
       public          postgres    false    217    3529    219            �           2606    82350    shifts fk_agency    FK CONSTRAINT     r   ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT fk_agency FOREIGN KEY (agency_id) REFERENCES public.agency(id);
 :   ALTER TABLE ONLY public.shifts DROP CONSTRAINT fk_agency;
       public          postgres    false    217    3529    224            �           2606    82355    shifts fk_home    FK CONSTRAINT     l   ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT fk_home FOREIGN KEY (home_id) REFERENCES public.home(id);
 8   ALTER TABLE ONLY public.shifts DROP CONSTRAINT fk_home;
       public          postgres    false    3535    224    221            �           2606    82275    agency fk_users    FK CONSTRAINT     n   ALTER TABLE ONLY public.agency
    ADD CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES public.users(id);
 9   ALTER TABLE ONLY public.agency DROP CONSTRAINT fk_users;
       public          postgres    false    215    3527    217            �           2606    82289    carers fk_users    FK CONSTRAINT     n   ALTER TABLE ONLY public.carers
    ADD CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES public.users(id);
 9   ALTER TABLE ONLY public.carers DROP CONSTRAINT fk_users;
       public          postgres    false    219    3527    215            �           2606    82303    home fk_users    FK CONSTRAINT     l   ALTER TABLE ONLY public.home
    ADD CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES public.users(id);
 7   ALTER TABLE ONLY public.home DROP CONSTRAINT fk_users;
       public          postgres    false    221    215    3527            �           2606    82333 &   home_agency home_agency_agency_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.home_agency
    ADD CONSTRAINT home_agency_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES public.agency(id) ON UPDATE CASCADE ON DELETE CASCADE;
 P   ALTER TABLE ONLY public.home_agency DROP CONSTRAINT home_agency_agency_id_fkey;
       public          postgres    false    217    3529    222            �           2606    82328 $   home_agency home_agency_home_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.home_agency
    ADD CONSTRAINT home_agency_home_id_fkey FOREIGN KEY (home_id) REFERENCES public.home(id) ON UPDATE CASCADE ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.home_agency DROP CONSTRAINT home_agency_home_id_fkey;
       public          postgres    false    221    3535    222            �           2606    90392 "   home_carer home_carer_home_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.home_carer
    ADD CONSTRAINT home_carer_home_id_fkey FOREIGN KEY (home_id) REFERENCES public.home(id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.home_carer DROP CONSTRAINT home_carer_home_id_fkey;
       public          postgres    false    221    3535    237            �           2606    98610 ,   home_guest_user home_guest_user_home_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.home_guest_user
    ADD CONSTRAINT home_guest_user_home_id_fkey FOREIGN KEY (home_id) REFERENCES public.home(id) ON DELETE CASCADE;
 V   ALTER TABLE ONLY public.home_guest_user DROP CONSTRAINT home_guest_user_home_id_fkey;
       public          postgres    false    241    3535    221            �           2606    82500    shift shift_agency_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shift
    ADD CONSTRAINT shift_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES public.agency(id) ON DELETE CASCADE;
 D   ALTER TABLE ONLY public.shift DROP CONSTRAINT shift_agency_id_fkey;
       public          postgres    false    3529    217    230            �           2606    82534 $   shift_home shift_home_agency_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shift_home
    ADD CONSTRAINT shift_home_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES public.agency(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.shift_home DROP CONSTRAINT shift_home_agency_id_fkey;
       public          postgres    false    3529    234    217            �           2606    82529 "   shift_home shift_home_home_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shift_home
    ADD CONSTRAINT shift_home_home_id_fkey FOREIGN KEY (home_id) REFERENCES public.home(id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.shift_home DROP CONSTRAINT shift_home_home_id_fkey;
       public          postgres    false    221    3535    234            �           2606    82495    shift shift_home_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shift
    ADD CONSTRAINT shift_home_id_fkey FOREIGN KEY (home_id) REFERENCES public.home(id) ON DELETE CASCADE;
 B   ALTER TABLE ONLY public.shift DROP CONSTRAINT shift_home_id_fkey;
       public          postgres    false    230    221    3535            �           2606    82524 #   shift_home shift_home_shift_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shift_home
    ADD CONSTRAINT shift_home_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.shift(id) ON DELETE CASCADE;
 M   ALTER TABLE ONLY public.shift_home DROP CONSTRAINT shift_home_shift_id_fkey;
       public          postgres    false    234    230    3547            �           2606    82469 "   timesheet timesheet_agency_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.timesheet
    ADD CONSTRAINT timesheet_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES public.agency(id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.timesheet DROP CONSTRAINT timesheet_agency_id_fkey;
       public          postgres    false    3529    217    226            �           2606    82454 !   timesheet timesheet_carer_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.timesheet
    ADD CONSTRAINT timesheet_carer_id_fkey FOREIGN KEY (carer_id) REFERENCES public.carers(id) ON DELETE CASCADE;
 K   ALTER TABLE ONLY public.timesheet DROP CONSTRAINT timesheet_carer_id_fkey;
       public          postgres    false    219    226    3533            �           2606    82459     timesheet timesheet_home_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.timesheet
    ADD CONSTRAINT timesheet_home_id_fkey FOREIGN KEY (home_id) REFERENCES public.home(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.timesheet DROP CONSTRAINT timesheet_home_id_fkey;
       public          postgres    false    226    3535    221            �   Y   x���t��/.��UK��I�TpN,J�	64	�44R�H,J�/JQ.)JM-���LI�I-N*�/M��407165�0�04�4������� �      �   )   x����4�24 R&\��@ʔ��H�q)s�=... g�      �   o   x��A
�0���)r��L��l��P����H�)Hiz�cBXӚ�I���W����>[�Zz+����+��mǷ���:��	����C��9��|�A�&1<�z��R¼�      �   U   x�34��K-�I�TpN,JU�44R�H,J�/JQ.)JM-���LI�I-N*�/M��	64	�407165�0�04�41������� �;3      �      x�34������� pU      �      x������ � �      �   _   x�3��K-qH�M���K���T1JT14P�KsM42��H*)�(�(+
0���w�I�ȷȩtvLqK�,�p��H��6�44 "�=... ���      �      x������ � �      �      x������ � �      �   0   x�32�4202�54�50�44�����22A�� DMᢆ�p�=... ���      �   ,   x�340����swq��42�44��4�64��6������ �RG      �   K   x�3����swq���!C��<.N?Ow���)g��P�B��TY��9g���k���T�Ȅ+F��� ��      �      x������ � �      �      x������ � �      �   �   x�e�Kr�0  �ur�@��;q
�RE�m��&� 2Mb��z��w�熠��U���Ϭ%�CdW�~�p��A��F������zzk��<ԍ |�����l�! ���+���U�f�8��lI�'7�$.���z������Z��B�_��o*���FMo{�gv:/��U�ʳD$s"�Y�T8��6��
���/Dϣ��g��?&����P     