CREATE TABLE IF NOT EXISTS public.board
(
    board_id character varying(1000) COLLATE pg_catalog."default" NOT NULL,
    name character varying(1000) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT board_pkey PRIMARY KEY (board_id)
);

CREATE TABLE IF NOT EXISTS public.rows
(
    api_id character varying(1000) COLLATE pg_catalog."default" NOT NULL,
    group_name character varying(1000) COLLATE pg_catalog."default" NOT NULL,
    task_name character varying(1000) COLLATE pg_catalog."default",
    updated_at timestamp without time zone,
    other_columns jsonb,
    board_id character varying(1000) COLLATE pg_catalog."default",
    CONSTRAINT rows_pkey PRIMARY KEY (api_id),
    CONSTRAINT rows_board_id_fkey FOREIGN KEY (board_id)
    REFERENCES public.board (board_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.task_updates
(
    update_id integer NOT NULL DEFAULT nextval('task_updates_update_id_seq'::regclass),
    text_body text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone,
    creator character varying(1000) COLLATE pg_catalog."default",
    row_id character varying(1000) COLLATE pg_catalog."default",
    CONSTRAINT task_updates_pkey PRIMARY KEY (update_id),
    CONSTRAINT task_updates_row_id_fkey FOREIGN KEY (row_id)
        REFERENCES public.rows (api_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)


