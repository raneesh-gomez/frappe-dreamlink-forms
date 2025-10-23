import frappe
import os
import json


@frappe.whitelist()
def get_context(context):
	context.no_cache = 1


def get_manifest():
	"""Read the Vite manifest file to get hashed asset names"""
	# Try both locations
	manifest_paths = [
		frappe.get_app_path('dreamlink_forms', 'public', 'form_manager_app',
							'manifest.json'),
		frappe.get_app_path('dreamlink_forms', 'public', 'form_manager_app', '.vite',
							'manifest.json')
	]

	for manifest_path in manifest_paths:
		frappe.log_error(f"Checking manifest at: {manifest_path}", "React Integration Debug")
		if os.path.exists(manifest_path):
			with open(manifest_path, 'r') as f:
				manifest_data = json.load(f)
				frappe.log_error(
					f"Found manifest at: {manifest_path}\nContents: {json.dumps(manifest_data, indent=2)}",
					"React Integration Debug")
				return manifest_data

	frappe.log_error(f"Manifest not found in any location", "React Integration Error")
	return None


@frappe.whitelist()
def get_assets():
	"""Get the built asset URLs"""
	manifest = get_manifest()

	if not manifest:
		frappe.log_error("Manifest is None", "React Integration Error")
		return {
			'js': [],
			'css': [],
			'error': 'Manifest not found'
		}

	js_files = []
	css_files = []

	# Parse Vite manifest - it maps source files to built files
	# Look for main.tsx or index.html entry
	for key, value in manifest.items():
		frappe.log_error(f"Processing manifest key: {key}, value: {json.dumps(value)}",
						 "React Integration Debug")

		# Check if this is an entry point
		if value.get('isEntry', False):
			if 'file' in value:
				js_files.append(f'/assets/dreamlink_forms/form_manager_app/{value["file"]}')
			if 'css' in value:
				for css in value['css']:
					css_files.append(f'/assets/dreamlink_forms/form_manager_app/{css}')

	result = {
		'js': js_files,
		'css': css_files
	}

	frappe.log_error(f"Returning assets: {json.dumps(result, indent=2)}",
					 "React Integration Debug")

	return result