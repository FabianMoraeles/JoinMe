-- One-off cleanup of test/demo data created while verifying the real backend end-to-end this
-- session (activation, ratings hide/reveal, storage). Safe to run once; nothing here recurs.
delete from ratings where experience_id = '55555555-5555-4555-8555-555555555555';
delete from experiences where id = 'fddd368f-1854-4716-ae24-bb150355eaeb';
delete from device_bindings
where device_id like 'smoke-test-%'
   or device_id like 'rating-test-%'
   or device_id like 'storage-test%';
