
using System;
using System.Collections.Generic;

namespace AngularWeb
{
	public static class Ext
	{
		//Copy all source object primitive properties to destination
		public static void CopyTo<T>(this T source, T dest) where T : class
		{
			if (source == null || dest == null)
				return;

			foreach (var prop in typeof(T).GetProperties())
			{
				if (!prop.PropertyType.IsValueType && prop.PropertyType != typeof(string))
					continue; //only primitives

				prop.SetValue(dest, prop.GetValue(source, null), null);
			}
		}

		//sync items from source list to destination
		public static void CopyToList<T>(this IList<T> source, IList<T> dest) where T : class, IEquatable<T>, new()
		{
			//Process source list
			foreach (var sourceItem in source)
			{
				var found = false;
				foreach (var destItem in dest)
				{
					//Update existing items
					if (sourceItem.Equals(destItem))
					{
						found = true;
						sourceItem.CopyTo(destItem);
					}
				}
				//Add new items
				if (!found)
				{
					var item = new T();
					sourceItem.CopyTo(item);
					dest.Add(item);
				}
			}
			//Process destination list
			foreach (var destItem in new List<T>(dest))
			{
				var found = false;
				foreach (var sourceItem in source)
				{
					if (destItem.Equals(sourceItem)) found = true;
				}
				//Remove old items
				if (!found)
				{
					dest.Remove(destItem);
				}
			}
		}

	};
}
