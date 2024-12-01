#!/bin/bash

concurrent_invokes=40
event_file_path="functions/authorizer/events/event.json"
output_log="debug.log"
temp_dir=$(mktemp -d)

> "$output_log"

if [[ ! -f "$event_file_path" ]]; then
  echo "Error: Event file not found at $event_file_path"
  exit 1
fi

invoke_function() {
  local invoke_id=$1
  local temp_file="$temp_dir/invoke_$invoke_id.log"
  {
    echo "================ Invoke $invoke_id ==============="
    echo "=================================================="
    sam local invoke JwksRsaCustomAuthorizer \
      --parameter-overrides Environment=local \
      --env-vars env.json \
      --docker-network api_default \
      --event "$event_file_path"
    echo "=================================================="
    echo
  } >> "$temp_file" 2>&1
}

for i in $(seq 1 $concurrent_invokes); do
  invoke_function "$i" &
done
wait

for i in $(seq 1 $concurrent_invokes); do
  cat "$temp_dir/invoke_$i.log" >> "$output_log"
done

rm -r "$temp_dir"

echo "All invocations completed. Logs are available in $output_log."
